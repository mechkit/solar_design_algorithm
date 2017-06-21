var tables = {
  
  // Table 1
  // NEC TABLE 310.15(B)(3)(c)
  // Ambient Temperature Adjustment for Circular Raceways Exposed to Sunlight on or Above Rooftops
  // Distance Above Roof to Bottom of Conduit (in) | Temperature Adder (ºC)
  1: {
    '0': ['33'],
    '0.5': ['22'],
    '3.5': ['17'],
    '12': ['14'],
    '36': ['0'],
  },
  
  // Table 2
  // NEC TABLE 310.15(B)(2)(a)
  // Ambient Temperature Correction Factors Based on 30 C
  // Ambient Temp (C) | 90°C
  2: {
    '0': ['1.15'],
    '11': ['1.12'],
    '16': ['1.08'],
    '21': ['1.04'],
    '26': ['1'],
    '31': ['0.96'],
    '36': ['0.91'],
    '41': ['0.87'],
    '46': ['0.82'],
    '51': ['0.76'],
    '56': ['0.71'],
    '61': ['0.65'],
    '66': ['0.58'],
    '71': ['0.5'],
    '76': ['0.41'],
    '81': ['0.29'],
  },
  
  // Table 3
  // NEC TABLE 310.15(B)(3)(a)
  // Adjustment Factors for More Than Three Current-Carrying Conductors in a Raceway or Cable
  // No. of Conductors | Adjustment Factor
  3: {
    '0': ['1'],
    '4': ['0.8'],
    '7': ['0.7'],
    '10': ['0.5'],
    '21': ['0.45'],
    '31': ['0.4'],
    '41': ['0.35'],
  },
  
  // Table 4
  // TABLE 310.15(B)(16)
  // Allowable Ampacities of Single Insulated Conductors, Not More Than Three Current-Carrying Conductors is Raceway, Cable or Direct Burial, Based on Temperature of 30 C
  // THWN-2 90 C | Size (AWG or kcmil)
  4: {
    '14': ['18'],
    '18': ['16'],
    '25': ['14'],
    '30': ['12'],
    '40': ['10'],
    '55': ['8'],
    '75': ['6'],
    '95': ['4'],
    '115': ['3'],
    '130': ['2'],
    '145': ['1'],
    '170': ['1/0'],
    '195': ['2/0'],
    '225': ['3/0'],
    '260': ['4/0'],
  },
  
  // Table 5
  // TABLE 310.15(B)(16)
  // Allowable Ampacities of Single Insulated Conductors, Not More Than Three Current-Carrying Conductors is Raceway, Cable or Direct Burial, Based on Temperature of 30 C
  // THWN-2 90 C | Size (AWG or kcmil)
  5: {
    '18': ['14'],
    '16': ['18'],
    '14': ['25'],
    '12': ['30'],
    '10': ['40'],
    '8': ['55'],
    '6': ['75'],
    '4': ['95'],
    '3': ['115'],
    '2': ['130'],
    '1': ['145'],
    '1/0': ['170'],
    '2/0': ['195'],
    '3/0': ['225'],
    '4/0': ['260'],
  },
  
  // Table 6
  // NEC (chapter 9?) Table 8
  // Conductor Properties
  // Size (AWG or kCmil) | Stranding | Diameter
  6: {
    '18': ['7', '0.046'],
    '16': ['7', '0.058'],
    '14': ['7', '0.073'],
    '12': ['7', '0.092'],
    '10': ['7', '0.116'],
    '8': ['7', '0.146'],
    '6': ['7', '0.184'],
    '4': ['7', '0.232'],
    '3': ['7', '0.260'],
    '2': ['7', '0.292'],
    '1': ['19', '0.332'],
    '1/0': ['19', '0.372'],
    '2/0': ['19', '0.418'],
    '3/0': ['19', '0.470'],
    '4/0': ['19', '0.528'],
  },
  
  // Table 7
  // Article 352
  // Rigid PVC Conduit (PVC), Schedule 80
  // "40% Fill Area - Over 2 Wires (in2)" | PVC Sch 80 Trade Size
  7: {
    '0.087': ['1/2'],
    '0.164': ['3/4'],
    '0.275': ['1'],
    '0.495': ['1-1/4'],
    '0.684': ['1-1/2'],
    '1.15': ['2'],
    '1.647': ['2-1/2'],
    '2.577': ['3'],
    '3.475': ['3-1/2'],
    '4.503': ['4'],
  },
    
  // Table 8
  // Article 358
  // Electrical Metallic Tubing (EMT)
  // EMT | Trade Size
  8: {
    //'0.122': ['1/2'],
    '0.213': ['3/4'],
    '0.346': ['1'],
    '0.598': ['1-1/4'],
    '0.814': ['1-1/2'],
    '1.342': ['2'],
    '2.343': ['2-1/2'],
    '3.538': ['3'],
    '4.618': ['3-1/2'],
    '5.901': ['4'],
  },
  
  //Table 9
  //240.6 Standard OCPD Ampere Ratings
  9: {
    '15': ['15'],
    '20': ['20'],
    '25': ['25'],
    '30': ['30'],
    '35': ['35'],
    '40': ['40'],
    '45': ['45'],
    '50': ['50'],
    '60': ['60'],
    '70': ['70'],
    '80': ['80'],
    '90': ['90'],
    '100': ['100'],
    '110': ['110'],
    '125': ['125'],
    '150': ['150'],
    '175': ['175'],
    '200': ['200'],
    '250': ['250'],
    '300': ['300'],
    '350': ['350'],
    '450': ['450'],
    '500': ['500'],
    '600': ['600'],
    '700': ['700'],
  },
};

module.exports = tables;
