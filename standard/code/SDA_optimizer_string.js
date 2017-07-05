var settings_constants = require('./settings/settings_constants.js');
var tables = require('./tables.js');
var f = require('./functions/functions.js');
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
  var optimizer = system_settings.state.system.optimizer;
  var interconnection = system_settings.state.system.interconnection;
  var circuits = system_settings.state.system.circuits;
  var error_check = system_settings.state.system.error_check;

  var report_error = function(error_message){
    notes.errors.push(error_message);
  };

  ///////////////////////////////////////////
  /// calculations from standard document ///
  ///////////////////////////////////////////
  source.vmp = module.pmp / source.max_power * inverter.dc_voltage_nominal;
  source.imp = source.max_power / inverter.dc_voltage_nominal;
  source.voc = 1 * array.largest_string;
  source.isc = 0.6; //amps
  
  inverter.dc_voltage_nominal = inverter.mppt_max;
  source.vmp = module.pmp / source.max_power * inverter.dc_voltage_nominal;
  source.imp = source.max_power / inverter.dc_voltage_nominal;
  source.voc = 1 * array.largest_string;
  source.isc = 0.6; //amps
  source.i_max = optimizer.max_output_current;
  source.max_power = module.pmp * array.largest_string;
  source.Isc_adjusted = module.isc * 1.25;
  array.max_sys_voltage = inverter.dc_voltage_nominal;
  array.min_voltage = inverter.dc_voltage_nominal;
  array.pmp = array.num_of_modules * module.pmp;
  array.circuits_per_MPPT = Math.ceil( array.num_of_strings / inverter.mppt_channels );
  array.combined_isc = source.i_max * array.circuits_per_MPPT;
  module.max_voltage = module.voc * ( 1 + module.tc_voc_percent / 100 * ( array.min_temp - 25));
  inverter.AC_OCPD_max = sf.if( sf.not( inverter.max_ac_ocpd ), inverter.max_ac_output_current * 1.25, inverter.max_ac_ocpd );
  inverter.nominal_ac_output_power = inverter['nominal_ac_output_power_'+inverter.grid_voltage];
  inverter.max_ac_output_current = inverter['max_ac_output_current_'+inverter.grid_voltage];
  
  
  error_check.array_test_1 = array.max_sys_voltage > module.max_system_v;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.array_test_1 ){ report_error( 'Maximum system voltage exceeds the modules max system voltage.' );}
  
  error_check.array_test_2 = array.max_sys_voltage > array.code_limit_max_voltage;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.array_test_2){ report_error( 'Maximum system voltage exceeds the maximum voltage allows by code.' );}
  
  error_check.array_test_3 = array.max_sys_voltage > inverter.vmax;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.array_test_3){ report_error( 'Maximum system voltage exceeds the inverter maximum voltage rating' );}
  
  error_check.array_test_4 = array.min_voltage <= inverter.voltage_range_min;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.array_test_4){ report_error( 'Minimum Array Vmp is less than the inverter minimum operating voltage.' );}
  
  error_check.power_check_array = array.pmp > 10000;
  // If error check is true, flag system design failure, and report notice to user.
  if( error_check.power_check_array ){ report_error( 'Array total power exceeds 10kW' );}
  
  error_check.current_check_inverter = ( array.combined_isc * 1.25 ) > inverter.isc_channel;
  // If error check is true, flag system design failure, and report notice to user.
  if( error_check.current_check_inverter ){ report_error( 'PV output circuit maximum current exceeds the inverter maximum dc current per MPPT input.' );}
  
  
  error_check.module_power_too_high = module.pmp > optimizer.rated_max_power;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_power_too_high ){ report_error( 'Optimizer is undersized for module.' );}
  error_check.module_voltage_too_low = module.vmp < optimizer.mppt_op_range_min ;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_voltage_too_low ){ report_error( 'Module does not meet minimum optimizer operating voltage.' );}
  error_check.module_voltage_too_high = module.vmp > optimizer.mppt_op_range_max ;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_voltage_too_high ){ report_error( 'Module exceeds optimizer operating voltage range.' );}
  
  error_check.module_voltage = module.vmp > inverter.vmax;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_voltage ){ report_error( 'Module voltage exceeds inverter maximum.' );}
  
  error_check.module_max_voltage = module.max_voltage > optimizer.max_input_voltage ;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.module_max_voltage ){ report_error( 'Module maximum voltage exceeds the maximum allowed by the optimizer.' );}
  var circuit_names = [
    'exposed source circuit wiring',
    'pv dc source circuits',
    'inverter ac output circuit',
  ];
  circuit_names.forEach(function(circuit_name){
    circuits[circuit_name] = {};
  });
  
  
  // Use Table 1, lookup: module.array_offset_from_roof, return the first column.
  circuits['exposed source circuit wiring'].temp_adder = sf.lookup( module.array_offset_from_roof, tables[1] );
  
  circuits['exposed source circuit wiring'].max_current = array.combined_isc;
  circuits['exposed source circuit wiring'].max_voltage = source.voc;
  circuits['pv dc source circuits'].max_current         = array.combined_isc;
  circuits['pv dc source circuits'].max_voltage         = source.voc;
  circuits['exposed source circuit wiring'].total_cc_conductors = ( array.num_of_strings * 2 );
  circuits['exposed source circuit wiring'].total_conductors    = ( array.num_of_strings * 2 ) + 1;
  circuits['pv dc source circuits'].total_cc_conductors         = ( array.num_of_strings * 2 );
  circuits['pv dc source circuits'].total_conductors            = ( array.num_of_strings * 2 ) + 1;
  circuits['inverter ac output circuit'].max_voltage = inverter.grid_voltage;
  circuits['inverter ac output circuit'].max_current = inverter.max_ac_output_current;
  
  var conductors_options = {
    '120V': ['ground','neutral','L1'],
    '240V': ['ground','neutral','L1','L2'],
    '208V': ['ground','neutral','L1','L2'],
    '277V': ['ground','neutral','L1'],
    '480V Wye': ['ground','neutral','L1','L2','L3'],
    '480V Delta': ['ground','L1','L2','L3'],
  };
  inverter.conductors = conductors_options[inverter.grid_voltage+'V'];
  inverter.num_conductors = inverter.conductors.length;
  circuits['inverter ac output circuit'].total_cc_conductors = inverter.num_conductors - 1;
  circuits['inverter ac output circuit'].total_conductors = inverter.num_conductors;
  
  circuit_names.forEach(function(circuit_name, i){
    var circuit = circuits[circuit_name];
    circuit.id = i;
    
    circuit.power_type = sf.index( ['DC', 'DC', 'AC'], circuit.id );
    // If temperature adder is not defined, set it to 0 for use in further calculations.
    circuit.temp_adder = sf.if( circuit.temp_adder, circuit.temp_adder, 0 );
    
    
    
    circuit.conductor = sf.index( ['DC+/DC-, EGC', 'DC+/DC-, EGC', 'L1/L2, N, EGC'], circuit.id );
    circuit.location = sf.index( ['Free air', 'Conduit/Exterior', 'Conduit/Interior'], circuit.id );
    circuit.material = 'CU';
    circuit.type = sf.index( ['PV Wire, bare', 'THWN-2', 'THWN-2'], circuit.id );
    circuit.volt_rating = 600;
    circuit.wet_temp_rating = 90;
    circuit.conduit_type = sf.index( ['-', 'Metallic', 'Metallic'], circuit.id );      
    
    
    
    circuit.max_conductor_temp = array.max_temp + circuit.temp_adder;
    // Use Table 2, lookup: circuit.max_conductor_temp, return the first column.
    circuit.temp_correction_factor = sf.lookup( circuit.max_conductor_temp, tables[2] );
    // Use Table 3, lookup: circuit.total_cc_conductors, return the first column.
    circuit.conductors_adj_factor = sf.lookup( circuit.total_cc_conductors , tables[3] );
    circuit.min_req_cond_current_1 = circuit.max_current * 1.25;
    circuit.min_req_cond_current_2 = circuit.max_current / ( circuit.temp_correction_factor * circuit.conductors_adj_factor );
    circuit.min_req_cond_current_3 = circuit.max_current * 1.25 * 1.25;
    circuit.min_req_cond_current    = sf.max( circuit.min_req_cond_current_1, circuit.min_req_cond_current_2 );
    circuit.min_req_OCPD_current_DC = sf.max( circuit.min_req_cond_current_2, circuit.min_req_cond_current_3  );
    circuit.min_req_OCPD_current = sf.if( circuit.power_type === 'DC', circuit.min_req_OCPD_current_DC, circuit.min_req_cond_current_1);
    circuit.OCPD_required = sf.index( [false, false, true ], circuit.id );
    circuit.ocpd_type = sf.index( ['NA', 'PV Fuse', 'Circuit Breaker'], circuit.id );
    
    // Use Table 9, lookup: circuit.min_req_OCPD_current, find the next highest or matching value, return the index column.
    circuit.OCPD = sf.lookup( circuit.min_req_OCPD_current, tables[9], 0, true, true);
    if( circuit_name === 'inverter ac output circuit' ){ inverter.OCPD = circuit.OCPD; }
    circuit.min_req_cond_current = sf.if( circuit.OCPD_required, circuit.OCPD, circuit.min_req_OCPD_current );
    
    // Use Table 4, lookup: circuit.min_req_cond_current, find the next highest value, return the index column.
    circuit.conductor_current = sf.lookup( circuit.min_req_cond_current, tables[4], 0, true);
    // Use Table 4, lookup: circuit.conductor_current, return the first column.
    circuit.conductor_size_min = sf.lookup( circuit.conductor_current, tables[4] );
    if( circuit_name === 'exposed source circuit wiring' ){ 
      circuit.conductor_size_min = '10'; 
    }
    if( circuit_name === 'pv dc source circuits' ){ 
      circuit.conductor_size_min = '10'; 
    }
    if( circuit_name === 'inverter ac output circuit' ){
      if( circuit.OCPD === 15){
        circuit.conductor_size_min = '14'; 
      } else if( circuit.OCPD === 20){
        circuit.conductor_size_min = '12';
      } else if( circuit.OCPD === 25){
        circuit.conductor_size_min = '10';
      } else if( circuit.OCPD === 30){
        circuit.conductor_size_min = '10';
      }
    }
    // Use Table 5, lookup: circuit.conductor_size_min, return the first column.
    circuit.conductor_current = sf.lookup( circuit.conductor_size_min, tables[5], 1);
    // Use Table 6, lookup: circuit.conductor_size_min, return the first column.
    circuit.conductor_strands = sf.lookup( circuit.conductor_size_min, tables[6], 1 );
    // Use Table 6, lookup: circuit.conductor_size_min, return the second column.
    circuit.conductor_diameter = sf.lookup( circuit.conductor_size_min, tables[6], 2 );
    circuit.min_req_conduit_area_40 = circuit.total_conductors * ( 0.25 * PI() * math.pow(circuit.conductor_diameter, 2) );
    
    // Use Table 7, lookup: circuit.min_req_conduit_area_40, find the next highest value, return the first column.
    circuit.min_conduit_size_PVC_80 = sf.lookup( circuit.min_req_conduit_area_40, tables[7], 1, true );
    // Use Table 8, lookup: circuit.min_req_conduit_area_40, find the next highest value, return the first column.
    circuit.min_conduit_size_EMT = sf.lookup( circuit.min_req_conduit_area_40, tables[8], 1, true );
    circuit.min_conduit_size = circuit.min_conduit_size_EMT;
    if( circuit.conduit_type === '-' ){ circuit.min_conduit_size = '-'; }
    
    
    ///////
    // cleanup for display
    if( ! circuit.OCPD_required ){
      circuit.ocpd_type = '-';
      circuit.OCPD = '-';
    }
    circuit.conductor_size_min = circuit.conductor_size_min + ', ' + circuit.conductor_size_min;
    //////
    
  });
  interconnection.inverter_output_cur_sum = interconnection.inverter_output_cur_sum || inverter.max_ac_output_current;
  interconnection.inverter_ocpd_dev_sum = interconnection.inverter_ocpd_dev_sum || inverter.OCPD;
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
