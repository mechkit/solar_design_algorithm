# Solar Design Algorithm

The document below defines the calculations used to design and evaluate a PV system in preparation for creating electrical drawings.

The secondary documents are automatically created from this source:

  * [A printable PDF document describing the algorithm, with no computer code](SDA_standard.pdf).
  * [Key computer code used in FSEC's online express drawing creation application](SDA.js).
  * [A printable PDF document describing the algorithm and it's related computer code](SDA.pdf).

Note: For each section, the symbols are pre-pended by a section name to assist with their use in the computer code, in the form of "section.symbol".

## System specification

These are the what uniquely define the system design. Every other value is deterministically calculated from these variables. These are the user input in FSEC's online express design application.

| Description                                                   | Symbol                             | Unit |
|:--------------------------------------------------------------|:-----------------------------------|:-----|
| Inverter manufacturer name                                    | inverter.manufacturer_name         | -    |
| Inverter model                                                | inverter.device_model_number       | -    |
| Module manufacturer name                                      | array.manufacturer_name            | -    |
| Module model                                                  | array.device_model_number          | -    |
| Grid voltage                                                  | inverter.grid_voltage              | V    |
| Number of PV Source Circuits                                  | array.num_of_strings               | ea.  |
| Total Number of Modules                                       | array.num_of_modules               | ea.  |
| Maximum Number of Series-Connected Modules per Source Circuit | array.largest_string               | ea.  |
| Minimum Number of Series-Connected Modules per Source Circuit | array.smallest_string              | ea.  |
| Minimum Distance Above Roof (in)                              | module.array_offset_from_roof      | in.  |
| Main panel supply OCPD rating (A)                             | interconnection.supply_ocpd_rating | A    |
| Main panel busbar rating (A)                                  | interconnection.bussbar_rating     | A    |
| Total of load breakers (A)                                    | interconnection.load_breaker_total | A    |

## Constants

These are fixed values that are not calculated or provided by the user.

| Description                                             | Symbol                          | Limits               | Value used | Unit |
|:--------------------------------------------------------|:--------------------------------|:---------------------|:-----------|:-----|
| 2% Maximum Temperature                                  | array.max_temp                  | In Florida: 30 to 36 | 36         | °C   |
| Extreme Annual Mean Minimum Design Dry Bulb Temperature | array.min_temp                  | In Florida: -9 to 11 | -9         | °C   |
| Maximum Voltage Rating?                                 | array.code_limit_max_voltage    | 600                  | 600        | V    |
| Voltage Correction Factor                               | array.voltage_correction_factor |                      | 1.14       |      |


The [most extreme temperatures](http://www.solarabcs.org/about/publications/reports/expedited-permit/map/index.html) are used so that the designed system is usable anywhere in Florida. 
Voltage correction factor is taken from Table 690.7.

    array.max_temp = 36;
    array.min_temp = -9;
    array.code_limit_max_voltage = 600;
    array.voltage_correction_factor = 1.14;

---

## Manufacturer data

The following information is taken from the manufacturer specification sheets. In FSEC's online express design application, this information is stored in FSEC's database.

Inverter:

| Description                                                        | Symbol                               | Unit |
|:-------------------------------------------------------------------|:-------------------------------------|:-----|
| UL1741 listed/FSEC approved?                                       | inverter.ul_1741                     | -    |
| Is inverter tranformerless                                         | inverter.tranformerless              | -    |
| Inverter type (string, micro, DC-DC)                               | inverter.type ???                    | -    |
| Maximum inverters per branch                                       | inverter.max_per_branch ???          | -    |
| Maximum dc voltage, Vmax,inv (V)                                   | inverter.vmax                        | V    |
| MPPT minimum dc operating voltage (V)                              | inverter.mppt_min                    | V    |
| MPPT maximum operating voltage (V)                                 | inverter.mppt_max                    | V    |
| Min. dc operating voltage (V)                                      | inverter.voltage_range_min           | V    |
| Min. dc start voltage (V)                                          | inverter.vstart                      | V    |
| Number of inverter inputs or MPP trackers                          | inverter.mppt_channels               | A    |
| Maximum OCPD Rating (A)                                            | inverter.max_ac_ocpd                 | A    |
| Maximum DC short circuit current per inverter input or MPP tracker | inverter.isc_channel                 | A    |
| Maximum DC operating current per inverter input or MPP tracker     | inverter.imax_channel                | A    |
| Maximum DC input power 120                                         | inverter.max_dc_inputpower_120       | W    |
| Maximum DC input power 208                                         | inverter.max_dc_inputpower_208       | W    |
| Maximum DC input power 240                                         | inverter.max_dc_inputpower_240       | W    |
| Maximum DC input power 277                                         | inverter.max_dc_inputpower_277       | W    |
| Maximum DC input power 480                                         | inverter.max_dc_inputpower_480       | W    |
| Nominal AC output power 120                                        | inverter.nominal_ac_output_power_120 | W    |
| Nominal AC output power 208                                        | inverter.nominal_ac_output_power_208 | W    |
| Nominal AC output power 240                                        | inverter.nominal_ac_output_power_240 | W    |
| Nominal AC output power 277                                        | inverter.nominal_ac_output_power_277 | W    |
| Nominal AC output power 480                                        | inverter.nominal_ac_output_power_480 | W    |
| Maximum AC output current 120                                      | inverter.max_ac_output_current_120   | V    |
| Maximum AC output current 208                                      | inverter.max_ac_output_current_208   | V    |
| Maximum AC output current 240                                      | inverter.max_ac_output_current_240   | V    |
| Maximum AC output current 277                                      | inverter.max_ac_output_current_277   | V    |
| Maximum AC output current 480                                      | inverter.max_ac_output_current_480   | V    |

Microinverters also have the following values.

| Description                       | Symbol                        | Unit |
|:----------------------------------|:------------------------------|:-----|
| Maximum units per branch          | inverter.max_unitsperbranch   | -    |
| Minimum units per branch          | inverter.min_unitsperbranch   | -    |
| Minimum panel wattage             | inverter.min_panel_wattage    | W    |
| Maximum panel wattage             | inverter.max_panel_wattage    | W    |
| Maximum number of cells per panel | inverter.max_module_cells     | -    |
| Maximum watts per string          | inverter.max_watts_per_branch | -    |

DC-DC optimizer systems also have the following values for the main inverters.

| Description              | Symbol                      | Unit |
|:-------------------------|:----------------------------|:-----|
| Nominal DC input voltage | inverter.dc_voltage_nominal | V    |


DC-DC optimizers have the following values.

| Description                     | Symbol                         | Unit |
|:--------------------------------|:-------------------------------|:-----|
| Rated max power                 | optimizer.rated_max_power      | W    |
| Max input voltage               | optimizer.max_input_voltage    | V    |
| MPPT operating range min        | optimizer.mppt_op_range_min    | V    |
| MPPT operating range max        | optimizer.mppt_op_range_max    | V    |
| Max Short Circuit Current (Isc) | optimizer.max_isc              | A    |
| Max output current              | optimizer.max_output_current   | A    |
| Max output voltage              | optimizer.max_output_voltage   | V    |
| Min optimizers / string         | optimizer.min_optis_per_string | -    |
| Max optimizers / string         | optimizer.max_optis_per_string | -    |
| Max power / string              | optimizer.max_power_per_string | -    |


Module:

| Description                           | Symbol                    | Unit |
|:--------------------------------------|:--------------------------|:-----|
| Description                           | Symbol                    | Unit |
| FSEC certified                        | module.FSEC_approved      | -    |
| Maximum power @ STC (W)               | module.pmp                | W    |
| Open-circuit voltage @ STC (V)        | module.voc                | V    |
| Short-circuit current @ STC (A)       | module.isc                | A    |
| Maximum power voltage @ STC (V)       | module.vmp                | V    |
| Maximum power current @ STC (A)       | module.imp                | A    |
| Number of cells                       | module.total_number_cells | -    |
| Maximum overcurrent device rating (A) | module.max_series_fuse    | A    |
| Maximum system voltage rating (V)     | module.max_system_v       | V    |
| Temp Coeff Voc (%/°C)                 | module.tc_voc_percent     | %/°C |
| Temp Coeff Vmp (%/°C)                 | module.tc_vpmax_percent   | %/°C |
| Nameplate rating                      | module.nameplaterating    | W    |
