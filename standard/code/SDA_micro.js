var settings_constants = require('./settings/settings_constants.js');
var tables = require('./tables.js');
var f = require('functions');
var math = require('mathjs');
var sf = require('spreadsheet_functions');

var PI = function(){
  return math.pi;
};

var SDA = function(system_settings){
  var notes = system_settings.state.notes;

  var array = system_settings.state.system.array;
  var module = system_settings.state.system.module;
  var source = system_settings.state.system.source;
  var system = system_settings.state.system.module;
  var inverter = system_settings.state.system.inverter;
  var interconnection = system_settings.state.system.interconnection;
  var circuits = system_settings.state.system.circuits;
  var error_check = system_settings.state.system.error_check;

  var report_error = function(error_message){
    notes.errors.push(error_message);
  };

  ///////////////////////////////////////////
  /// calculations from standard document ///
  ///////////////////////////////////////////
  inverter.nominal_ac_output_power = inverter['nominal_ac_output_power_'+inverter.grid_voltage];
  inverter.max_ac_output_current = inverter['max_ac_output_current_'+inverter.grid_voltage];
  inverter.AC_OCPD_max = sf.if( sf.not( inverter.max_ac_ocpd ), inverter.max_ac_output_current * 1.25, inverter.max_ac_ocpd );
  source.max_power = module.pmp * array.largest_string;
  source.current = inverter.nominal_ac_output_power / 240 * array.largest_string;
  array.pmp = array.num_of_modules * module.pmp;    
  error_check.power_check_array = array.pmp > 10000;
  // If error check is true, flag system design failure, and report notice to user.
  if( error_check.power_check_array ){ report_error( 'Array total power exceeds 10kW' );}
  error_check.micro_branch_too_many_modules = array.largest_string > inverter.max_unitsperbranch;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.micro_branch_too_many_modules ){ report_error( 'The system has too many inverters per branch circuit.' );}
  
  error_check.micro_branch_too_few_modules = array.smallest_string < inverter.min_unitsperbranch;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.micro_branch_too_few_modules ){ report_error( 'The system has too many inverters per branch circuit.' );}
  error_check.micro_branch_too_much_power = source.max_power > inverter.max_watts_per_branch;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.micro_branch_too_much_power ){ report_error( 'The branch circuit power limit has exceeded the manufacturer\'s limit.' );}
  error_check.module_voltage_min = module.vmp < inverter.mppt_min;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_voltage_min ){ report_error( 'Module voltage does not meet inverter minimum.' );}
  error_check.module_voltage_max = module.vmp > inverter.mppt_max;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_voltage_max ){ report_error( 'Module voltage exceeds inverter maximum.' );}
  
  error_check.module_current = module.isc > inverter.isc_channel;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_current ){ report_error( 'Module current exceeds inverter maximum.' );}
  error_check.module_cells = module.total_number_cells > inverter.max_module_cells  ;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_cells ){ report_error( 'Module cell count exceeds the maximum allowed by the inverter.' );}
  var circuit_names = [
    'PV Microinverter AC sources',
    //'Combined AC sources',
  ];
  circuit_names.forEach(function(circuit_name){
    circuits[circuit_name] = {};
  });
  
  circuits['PV Microinverter AC sources'].max_current = source.current;
  circuits['PV Microinverter AC sources'].max_voltage = inverter.grid_voltage;
  var conductors_options = {
    '120V': ['ground','neutral','L1'],
    '240V': ['ground','neutral','L1','L2'],
    '208V': ['ground','neutral','L1','L2'],
    '277V': ['ground','neutral','L1'],
    '480V Wye': ['ground','neutral','L1','L2','L3'],
    '480V Delta': ['ground','L1','L2','L3'],
  };
  inverter.conductors = conductors_options[inverter.grid_voltage+'V'];
  inverter.num_conductors = inverter.conductors.length - 1;
  circuits['PV Microinverter AC sources'].total_cc_conductors = array.num_of_strings * inverter.num_conductors;
  circuits['PV Microinverter AC sources'].total_conductors = array.num_of_strings * inverter.num_conductors + 1;
  
  circuit_names.forEach(function(circuit_name, i){
    var circuit = circuits[circuit_name];
    circuit.id = i;
    
    
    circuit.power_type = sf.index( ['AC', 'AC', 'AC'], circuit.id );
    // If temperature adder is not defined, set it to 0 for use in further calculations.
    circuit.temp_adder = sf.if( circuit.temp_adder, circuit.temp_adder, 0 );
    
    
    circuit.max_conductor_temp = array.max_temp + circuit.temp_adder;
    // Use Table 2, lookup: circuit.max_conductor_temp, return the first column.
    circuit.temp_correction_factor = sf.lookup( circuit.max_conductor_temp, tables[2] );
    // Use Table 3, lookup: circuit.total_cc_conductors, return the first column.
    circuit.conductors_adj_factor = sf.lookup( circuit.total_cc_conductors , tables[3] );
    circuit.min_req_OCPD_current = circuit.max_current * 1.25;
    circuit.OCPD_required = sf.index( [ true ], circuit.id );
    circuit.ocpd_type = sf.index( ['Circuit Breaker'], circuit.id );
    
    // Use Table 9, lookup: circuit.min_req_OCPD_current, find the next highest or matching value, return the index column.
    circuit.OCPD = sf.lookup( circuit.min_req_OCPD_current, tables[9], 0, true, true);
    if( circuit.OCPD > 20 ){  circuit.OCPD = 20 }
    if( circuit_name === 'PV Microinverter AC sources' ){ inverter.OCPD = circuit.OCPD; }
    circuit.min_req_cond_current = sf.if( circuit.OCPD_required, circuit.OCPD, circuit.min_req_OCPD_current );
    
    // Use Table 4, lookup: circuit.min_req_cond_current, find the next highest value, return the index column.
    circuit.conductor_current = sf.lookup( circuit.min_req_cond_current, tables[4], 0, true);
    // Use Table 4, lookup: circuit.conductor_current, return the first column.
    circuit.conductor_size_min = sf.lookup( circuit.conductor_current, tables[4] );
    if( circuit.conductor_size_min > 10 ){
      circuit.conductor_size_min = 10; 
    }
    circuit.ground_size_min = circuit.conductor_size_min;
    if( circuit.ground_size_min > 8 ){
      circuit.ground_size_min = 8; 
    }
    // Use Table 5, lookup: circuit.conductor_size_min, return the first column.
    circuit.conductor_current = sf.lookup( circuit.conductor_size_min, tables[5], 1);
    // Correct conductor_current for temperature and conduit fill.
    circuit.conductor_current_cor = circuit.conductor_current * circuit.temp_correction_factor * circuit.conductors_adj_factor;
    // Use Table 6, lookup: circuit.conductor_size_min, return the first column.
    circuit.conductor_strands = sf.lookup( circuit.conductor_size_min, tables[6], 1 );
    // Use Table 6, lookup: circuit.conductor_size_min, return the second column.
    circuit.conductor_diameter = sf.lookup( circuit.conductor_size_min, tables[6], 2 );
    circuit.min_req_conduit_area_40 = circuit.total_conductors * ( 0.25 * PI() * math.pow(circuit.conductor_diameter, 2) );
    
    // Use Table 7, lookup: circuit.min_req_conduit_area_40, find the next highest value, return the first column.
    // circuit.min_conduit_size_PVC_80 = sf.lookup( circuit.min_req_conduit_area_40, tables[7], 1, true );
    // Use Table 8, lookup: circuit.min_req_conduit_area_40, find the next highest value, return the first column.
    circuit.min_conduit_size_EMT = sf.lookup( circuit.min_req_conduit_area_40, tables[8], 1, true );
    circuit.min_conduit_size = circuit.min_conduit_size_EMT;
  
    circuit.conductor = sf.index( ['L1/L2, N, EGC', 'L1/L2, N, EGC'], circuit.id );
    circuit.location = sf.index( ['Conduit/Interior', 'Conduit/Interior'], circuit.id );
    circuit.material = 'CU';
    circuit.type = sf.index( ['THWN-2', 'THWN-2'], circuit.id );
    circuit.volt_rating = 600;
    circuit.wet_temp_rating = 90;
    circuit.conduit_type = sf.index( ['Metallic', 'Metallic'], circuit.id );
    
    
    ///////
    // cleanup for display
    if( ! circuit.OCPD_required ){
      circuit.ocpd_type = '-';
      circuit.OCPD = '-';
    }
    circuit.conductor_size_min = circuit.conductor_size_min;
    //////
    
  });
  interconnection.inverter_output_cur_sum = source.current * array.num_of_strings;
  interconnection.inverter_ocpd_dev_sum = inverter.OCPD * array.num_of_strings;
  interconnection.max_ac_current = source.current;
  interconnection.max_ac_current_125 = interconnection.max_ac_current * 1.25;
  interconnection.check_1 = ( ( interconnection.inverter_output_cur_sum * 1.25 ) + interconnection.supply_ocpd_rating ) > interconnection.bussbar_rating;
  interconnection.check_2 = ( interconnection.inverter_output_cur_sum * 1.25 ) + interconnection.supply_ocpd_rating > interconnection.bussbar_rating * 1.2;
  interconnection.check_3 = ( interconnection.inverter_ocpd_dev_sum + interconnection.load_breaker_total ) > interconnection.bussbar_rating;
  
  error_check.interconnection_bus_pass = sf.and( interconnection.check_1, interconnection.check_2, interconnection.check_3 );
  // If error check is true, flag system design failure, and report notice to user.
  if( error_check.interconnection_bus_pass ){ report_error( 'The busbar is not compliant.' );}
  
  error_check.interconnection_check_4 = interconnection.supply_ocpd_rating > interconnection.bussbar_rating;
  // If error check is true, flag system design failure, and report notice to user.
  if( error_check.interconnection_check_4 ){ report_error( 'The rating of the overcurrent device protecting the busbar exceeds the rating of the busbar. ' );}

  ///////////////////////////////////////////////
  /// end calculations from standard document ///
  ///////////////////////////////////////////////

  return system_settings;
};

module.exports = SDA;
