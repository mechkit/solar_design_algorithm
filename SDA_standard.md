# Solar Design Algorithm

The document below defines the calculations used to design and evaluate a PV system in preparation for creating electrical drawings.
Most of the computer code is detailed below, and the full system calculation code is found [here](https://github.com/kshowalter/SPD_server/blob/master/lib/calculate_system.js). This algorithm is currently implemented in Javascript. The "Javascript" labeled boxes below is the actual code used in FSEC's application code.

Note: For each section the symbols are pre-pended by a section name when stored as a variable in the computer code, in the form of "section.symbol".

## System specification

These are the what uniquely define the system design. Every other value is deterministically caclated from these variables. These are the user input in FSEC's online express design application.

| Description                                                   | Symbol                                  | Unit |
|:--------------------------------------------------------------|:----------------------------------------|:-----|
| Inverter manufacturer name                                    | inverter.manufacturer_name              | -    |
| Inverter model                                                | inverter.device_model_number            | -    |
| Module manufacturer name                                      | array.manufacturer_name                 | -    |
| Module model                                                  | array.device_model_number               | -    |
| Grid voltage                                                  | inverter.grid_voltage                   | V    |
| Number of PV Source Circuits                                  | array.num_of_strings                    | ea.  |
| Total Number of Modules                                       | array.num_of_modules                    | ea.  |
| Maximum Number of Series-Connected Modules per Source Circuit | array.largest_string                    | ea.  |
| Minimum Number of Series-Connected Modules per Source Circuit | array.smallest_string                   | ea.  |
| Minimum Distance Above Roof (in)                              | module.array_offset_from_roof           | in.  |
| Grid type                                                     | interconnection.grid_type               | -    |
| Grid options                                                  | interconnection.grid_options            | -    |
| Connection type                                               | interconnection.connection_type         | -    |
| Main panel supply OCPD rating (A)                             | interconnection.supply_ocpd_rating      | A    |
| Main panel busbar rating (A)                                  | interconnection.bussbar_rating          | A    |
| Sum of inverter output overcurrent protection devices (A)     | interconnection.inverter_ocpd_dev_sum   | A    |
| Sum of inverter(s) output circuit current (A)                 | interconnection.inverter_output_cur_sum | A    |
| Total of load breakers (A)                                    | interconnection.load_breaker_total      | A    |



## Constants

These are fixed values that are not calculated or provided by the user.

| Description                                             | Symbol                       | Limits               | Value used | Unit |
|:--------------------------------------------------------|:-----------------------------|:---------------------|:-----------|:-----|
| 2% Maximum Temperature                                  | array.max_temp               | In Florida: 30 to 36 | 36         | °C   |
| Extreme Annual Mean Minimum Design Dry Bulb Temperature | array.min_temp               | In Florida: -9 to 11 | -9         | °C   |
| Maximum Voltage Rating?                                 | array.code_limit_max_voltage | 600                  | 600        | V    |

The most extreme temperatures are used so that the designed system is usable anywhere in Florida.



---

## Manufacturer data

The following information is taken from the manufacturer specification sheets. In our online express design application, this information is stored in FSEC's database.

Inverter:

| Description                                                        | Symbol                               | Unit |
|:-------------------------------------------------------------------|:-------------------------------------|:-----|
| UL1741 listed/FSEC approved?                                       | inverter.ul_1741                     | -    |
| Is inverter tranformerless                                         | inverter.tranformerless              | -    |
| Is this a microinverter                                            | ?                                    | V    |
| Maximum dc voltage, Vmax,inv (V)                                   | inverter.vmax                        | V    |
| MPPT minimum dc operating voltage (V)                              | inverter.mppt_min                    | V    |
| MPPT maximum operating voltage (V)                                 | inverter.mppt_max                    | V    |
| Min. dc operating voltage (V)                                      | inverter.voltage_range_min           | V    |
| Min. dc start voltage (V)                                          | inverter.vstart                      | V    |
| Maximum dc operating current per inverter input or MPP tracker (A) | inverter.imax_channel                | A    |
| Number of inverter inputs or MPP trackers                          | inverter.mppt_channels               | A    |
| Maximum OCPD Rating (A)                                            | inverter.max_ac_ocpd                 | A    |
| Imax total                                                         | inverter.imax_total                  | A    |
| Imax per MPPT channel                                              | inverter.imax_channel                | A    |
| Max DC input power 120                                             | inverter.max_dc_inputpower_120       | W    |
| Max DC input power 208                                             | inverter.max_dc_inputpower_208       | W    |
| Max DC input power 240                                             | inverter.max_dc_inputpower_240       | W    |
| Max DC input power 277                                             | inverter.max_dc_inputpower_277       | W    |
| Max DC input power 480                                             | inverter.max_dc_inputpower_480       | W    |
| Nominal AC output power 120                                        | inverter.nominal_ac_output_power_120 | W    |
| Nominal AC output power 208                                        | inverter.nominal_ac_output_power_208 | W    |
| Nominal AC output power 240                                        | inverter.nominal_ac_output_power_240 | W    |
| Nominal AC output power 277                                        | inverter.nominal_ac_output_power_277 | W    |
| Nominal AC output power 480                                        | inverter.nominal_ac_output_power_480 | W    |
| Max AC output current 120                                          | inverter.max_ac_output_current_120   | V    |
| Max AC output current 208                                          | inverter.max_ac_output_current_208   | V    |
| Max AC output current 240                                          | inverter.max_ac_output_current_240   | V    |
| Max AC output current 277                                          | inverter.max_ac_output_current_277   | V    |
| Max AC output current 480                                          | inverter.max_ac_output_current_480   | V    |

Module:

| Description                           | Symbol                  | Unit |
|:--------------------------------------|:------------------------|:-----|
| Description                           | Symbol                  | Unit |
| FSEC certified                        | module.FSEC_approved    | -    |
| Maximum power @ STC (W)               | module.pmp              | W    |
| Open-circuit voltage @ STC (V)        | module.voc              | V    |
| Short-circuit current @ STC (A)       | module.isc              | A    |
| Maximum power voltage @ STC (V)       | module.vmp              | V    |
| Maximum power current @ STC (A)       | module.imp              | A    |
| Maximum overcurrent device rating (A) | module.max_series_fuse  | A    |
| Maximum system voltage rating (V)     | module.max_system_v     | V    |
| Temp Coeff Voc (%/°C)                 | module.tc_voc_percent   | %/°C |
| Temp Coeff Vmp (%/°C)                 | module.tc_vpmax_percent | %/°C |
| Nameplate rating                      | module.nameplaterating  | W    |


---

## Calculations

### Modules, source circuits, and array

Calculation summary:

| Description                                                               | Symbol                          | Calculation                                                                                          | Unit |
|:--------------------------------------------------------------------------|:--------------------------------|:-----------------------------------------------------------------------------------------------------|:-----|
| Maximum Power (W)                                                         | source.max_power                | module.pmp * array.largest_string                                                                    | W    |
| Open-Circuit Voltage (V)                                                  | source.voc                      | module.voc * array.largest_string                                                                    | V    |
| Short-Circuit Current (A)                                                 | source.isc                      | module.isc                                                                                           | A    |
| Maximum Power Voltage (V)                                                 | source.vmp                      | module.vmp * array.largest_string                                                                    | V    |
| Maximum Power Current (A)                                                 | source.imp                      | module.imp                                                                                           | A    |
| Source Circuit Maximum Current (A), Isc x 1.25                            | source.Isc_adjusted             | module.isc * 1.25                                                                                    | A    |
| Voltage Correction Factor                                                 | array.voltage_correction_factor | sf.if( array.min_temp < -5, 1.12, 1.14)                                                              |      |
| Maximum system voltage Option 1 ( module temp. correction factor )        | array.max_sys_voltage_2         | source.voc * ( 1 + module.tc_voc_percent / 100 * ( array.min_temp - 25))                             | V    |
| Maximum system voltage Option 1 ( general temp. correction factor)        | array.max_sys_voltage_1         | source.voc * array.voltage_correction_factor                                                         | V    |
| Maximum system voltage                                                    | array.max_sys_voltage           | sf.max( array.max_sys_voltage_1, array.max_sys_voltage_2 )                                           |      |
| Minimum array voltage ( module temp. correction factor )                  | array.min_voltage               | array.smallest_string * module.vmp * ( 1 + module.tc_vpmax_percent / 100 * ( array.max_temp - 25 ) ) | V    |
| Maximum Power (W)                                                         | array.pmp                       | array.num_of_modules * module.pmp                                                                    | W    |
| Open-Circuit Voltage (V)                                                  | array.voc                       | source.voc                                                                                           | V    |
| Short-Circuit Current (A)                                                 | array.isc                       | module.isc * array.num_of_strings                                                                    | A    |
| Maximum Power Voltage (V)                                                 | array.vmp                       | module.vmp * array.largest_string                                                                    | V    |
| Maximum Power Current (A)                                                 | array.imp                       | module.imp * array.num_of_strings                                                                    | A    |
| PV Power Source Maximum Current (A)                                       | array.isc_adjusted              | array.isc * 1.25                                                                                     | A    |
| PV Power Source Maximum Voltage (V)                                       | array.vmp_adjusted              | array.max_sys_voltage_2                                                                              | V    |
| PV Power Source Minimum Voltage (V)                                       | array.vmp_adjusted_min          | ???                                                                                                  |      |
| Enter Maximum Number of Parallel Source Circuits per Output Circuit (1-2) | array.circuits_per_MPPT         | Math.ceil( array.num_of_strings / inverter.mppt_channels )                                           |      |
| PV Output Circuit Maximum Current (A)                                     | array.combined_isc              | source.isc * array.circuits_per_MPPT                                                                 | A    |
| PV Output Circuit Maximum Current (A), Isc x 1.25                         | array.combined_isc_adjusted     | module.isc * 1.25 * array.circuits_per_MPPT                                                          | A    |
| Maximum PV Output Circuit Voltage at Lowest Temperature                   | array.max_sys_voltage_2         | array.max_sys_voltage_2                                                                              | V    |



The maximum array voltage is must not exceed the maximum system voltage allowed by the module.


The maximum array voltage is must not exceed the maximum system voltage allowed by the building code.


The maximum array voltage is must not exceed the maximum system voltage allowed by the inverter.


The minimum array voltage must be greater than the inverter minimum operating voltage.


The total array power must be less than 10,000W.


The combined DC short circuit current from the array must be less than the maximum allowed per inverter MPPT channel.



### Inverter

If max_ac_ocpd is not provided by the manufacturer, it is calculated as follows:

AC_OCPD_max = max_ac_output_current * 1.25

The nominal_ac_output_power is selected from fields based on the user selected grid voltage. As an example, if the user selects 240 VAC, then:

nominal_ac_output_power = nominal_ac_output_power_240
max_ac_output_current = max_ac_ouput_current_240


### Interconnection

At least one of the following checks must not fail:

* The sum of 125 percent of the inverter(s) output circuit current and the rating of the overcurrent device protecting the busbar exceeded the ampacity of the busbar.               
* The sum of 125 percent of the inverter(s) output circuit current and the rating of the overcurrent device protecting the busbar exceeded 120 percent of the ampacity of the busbar.
* The sum of the ampere ratings of all overcurrent devices on panelboards exceeded the ampacity of the busbar.                                                                       



The panel's main OCPD must not exceed the bussbar rating.


### Conductor and conduit schedule

For string inverters, this is the circuit names:
* exposed source circuit wiring
* pv dc source circuits
* mppt dc input circuits
* inverter ac output circuit

For each circuit, calculate the following.

