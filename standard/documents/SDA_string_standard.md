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



---

## Manufacturer data

The following information is taken from the manufacturer specification sheets. In FSEC's online express design application, this information is stored in FSEC's database.

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
| Number of inverter inputs or MPP trackers                          | inverter.mppt_channels               | A    |
| Maximum OCPD Rating (A)                                            | inverter.max_ac_ocpd                 | A    |
| Maximum DC short circuit current per inverter input or MPP tracker | inverter.isc_channel                 |      |
| Maximum DC operating current per inverter input or MPP tracker     | inverter.imax_channel                |      |
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

| Description                                                               | Symbol                      | Calculation                                                                                          | Unit |
|:--------------------------------------------------------------------------|:----------------------------|:-----------------------------------------------------------------------------------------------------|:-----|
| Maximum Power (W)                                                         | source.max_power            | module.pmp * array.largest_string                                                                    | W    |
| Open-Circuit Voltage (V)                                                  | source.voc                  | module.voc * array.largest_string                                                                    | V    |
| Short-Circuit Current (A)                                                 | source.isc                  | module.isc                                                                                           | A    |
| Maximum Power Voltage (V)                                                 | source.vmp                  | module.vmp * array.largest_string                                                                    | V    |
| Maximum Power Current (A)                                                 | source.imp                  | module.imp                                                                                           | A    |
| Source Circuit Maximum Current (A), Isc x 1.25                            | source.Isc_adjusted         | module.isc * 1.25                                                                                    | A    |
| Maximum system voltage Option 1 ( module temp. correction factor )        | array.max_sys_voltage_2     | source.voc * ( 1 + module.tc_voc_percent / 100 * ( array.min_temp - 25))                             | V    |
| Maximum system voltage Option 1 ( general temp. correction factor)        | array.max_sys_voltage_1     | source.voc * array.voltage_correction_factor                                                         | V    |
| Maximum system voltage                                                    | array.max_sys_voltage       | sf.max( array.max_sys_voltage_1, array.max_sys_voltage_2 )                                           |      |
| Minimum array voltage ( module temp. correction factor )                  | array.min_voltage           | array.smallest_string * module.vmp * ( 1 + module.tc_vpmax_percent / 100 * ( array.max_temp - 25 ) ) | V    |
| Maximum Power (W)                                                         | array.pmp                   | array.num_of_modules * module.pmp                                                                    | W    |
| Open-Circuit Voltage (V)                                                  | array.voc                   | source.voc                                                                                           | V    |
| Short-Circuit Current (A)                                                 | array.isc                   | module.isc * array.num_of_strings                                                                    | A    |
| Maximum Power Voltage (V)                                                 | array.vmp                   | module.vmp * array.largest_string                                                                    | V    |
| Maximum Power Current (A)                                                 | array.imp                   | module.imp * array.num_of_strings                                                                    | A    |
| PV Power Source Maximum Current (A)                                       | array.isc_adjusted          | array.isc * 1.25                                                                                     | A    |
| PV Power Source Maximum Voltage (V)                                       | array.vmp_adjusted          | array.max_sys_voltage_2                                                                              | V    |
| PV Power Source Minimum Voltage (V)                                       | array.vmp_adjusted_min      | ???                                                                                                  |      |
| Enter Maximum Number of Parallel Source Circuits per Output Circuit (1-2) | array.circuits_per_MPPT     | Math.ceil( array.num_of_strings / inverter.mppt_channels )                                           |      |
| PV Output Circuit Maximum Current (A)                                     | array.combined_isc          | source.isc * array.circuits_per_MPPT                                                                 | A    |
| PV Output Circuit Maximum Current (A), Isc x 1.25                         | array.combined_isc_adjusted | module.isc * 1.25 * array.circuits_per_MPPT                                                          | A    |
| Maximum PV Output Circuit Voltage at Lowest Temperature                   | array.max_sys_voltage_2     | array.max_sys_voltage_2                                                                              | V    |



The maximum array voltage is must not exceed the maximum system voltage allowed by the module.


The maximum array voltage is must not exceed the maximum system voltage allowed by the building code.


The maximum array voltage must not exceed the maximum system voltage allowed by the inverter.


The minimum array voltage must be greater than the inverter minimum operating voltage.


The total array power must be less than 10,000W.


The combined DC short circuit current from the array must be less than the maximum allowed per inverter MPPT channel. 
The combined current is the total current per MPP tracker input. 
A correction factor of 1.25 is applied to the STC module Isc to account for high irradiance conditions.



### Inverter

If max_ac_ocpd is not provided by the manufacturer, it is calculated as follows:

AC_OCPD_max = max_ac_output_current * 1.25


The nominal_ac_output_power is selected from fields based on the user selected grid voltage. As an example, if the user selects 240 VAC, then:

nominal_ac_output_power = nominal_ac_output_power_240
max_ac_output_current = max_ac_ouput_current_240



### Conductor and conduit schedule

For string inverters, these are the circuit names:
* Exposed source circuit wiring: DC wires exposed on the roof.
* PV DC source circuits: DC wires in conduit.
* Inverter AC output circuit: AC circuits between the inverter and panel OCPD.


The array temperature adder is found in NEC table 310.15(B)(3)(c), or Table 1 in appendix, with module.array_offset_from_roof as "Distance Above Roof to Bottom of Conduit (in)".
The maximum current and voltage for the array DC circuits are equal to source.isc and source.voc. 


The number of DC current carrying conductors is equal to twice the number of strings in the array ( array.num_of_strings * 2 ). 
Total conductors adds one more for the ground.


The AC grid voltage is defined by system specifications (user input).


The maximum AC output is defined by the inverter manufacturer specifications.

AC conductors numbers are defined by the grid voltage.



For each circuit, calculate the following.


The array maximum temperature of the array is equal to the 2% maximum temperature at the install location, or nearest weather station. 
For a state wide design, the largest maximum temperature for the state is used.
Rooftop array circuits also have a temperature adjustment defined above.

There are three options to calculate the minimum required current:

  1. circuit.max_current * 1.25;
  2. circuit.max_current / ( circuit.temp_correction_factor * circuit.conductors_adj_factor );
  3. circuit.max_current * 1.25 * 1.25;



For AC circuits, the maximum of 1 and 2 is used. For DC circuits, the maximum of 2 and 3 is used.


For strings per MPP tracker of 2 or less, or for inverters with built in OCPD, additional DC OCPD is not required. The AC circuits do require OCPD at the panel.

Choose the OCPD that is greater or equal to the minimum required current.


Choose the conductor with a current rating that is greater than the OCPD rating from NEC table 310.15(B)(16). 
NEC chapter 9 table 8 provides more details on the conductor. For DC circuits, 10 AWG wire is used as a best practice. 

The NEC article 352 and 358 tables are used to find a conduit with a sufficent 40% fill rate to hold the total conductor size for all the conductors.



Select further wire details based on code requirements and best practices.

Exposed source circuit wiring:
* Conductor: 'DC+/DC-, EGC'
* Location: 'Free air'
* Material: 'CU'
* Type: 'PV Wire, bare'
* Volt rating: 600
* Wet temp rating: 90
* Conduit type: 'NA'

PV DC source circuits:
* Conductor: 'DC+/DC-, EGC'
* Location: 'Conduit/Exterior'
* Material: 'CU'
* Type: 'THWN-2'
* Volt rating: 600
* Wet temp rating: 90
* Conduit type: 'Metallic'

Inverter ac output circuit:
* Conductor: 'L1/L2, N, EGC'
* Location: 'Conduit/Interior'
* Material: 'CU'
* Type: 'THWN-2'
* Volt rating: 600
* Wet temp rating: 90
* Conduit type: 'Metallic'




### Interconnection

At least one of the following checks must not fail:

* The sum of 125 percent of the inverter(s) output circuit current and the rating of the overcurrent device protecting the busbar exceeded the ampacity of the busbar.               
* The sum of 125 percent of the inverter(s) output circuit current and the rating of the overcurrent device protecting the busbar exceeded 120 percent of the ampacity of the busbar.
* The sum of the ampere ratings of all overcurrent devices on panelboards exceeded the ampacity of the busbar.                                                                       




The panel's main OCPD must not exceed the bussbar rating.
