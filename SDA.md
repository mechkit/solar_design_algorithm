# Solar Design Algorithm

The document below defines the calculations used to design and evaluate a PV system in preparation for creating electrical drawings.
Most of the computer code is detailed below, and the full system calculation code is found [here](https://github.com/kshowalter/SPD_server/blob/master/lib/calculate_system.js). This algorithm is currently implemented in Javascript.

Note: For each section the symbols are perpended by a section name when stored as a variable in the computer code, in the form of "section.symbol".

## Calculation

### Location

| Description                                             | Symbol         | Limits               | Value used | Unit |
|:--------------------------------------------------------|:---------------|:---------------------|:-----------|:-----|
| Location                                                |                |                      |            |      |
| 2% Maximum Temperature                                  | array.max_temp | In Florida: 30 to 36 | 36         | °C   |
| Extreme Annual Mean Minimum Design Dry Bulb Temperature | array.min_temp | In Florida: -9 to 11 | -9         | °C   |

    array.max_temp = 36;
    array.min_temp = -9;



### System Specifications                                   |                              |                      |                             |      |      |       |

| inverter.inverter_make                                  | inverter.manufacturer_name   |                      | [user input]                |      |      | user  |
| inverter.inverter_model                                 | inverter.device_model_number |                      | [user input]                |      |      | user  |
| array.module_make                                       | array.manufacturer_name      |                      | [user input]                |      |      | user  |
| array.module_model                                      | array.device_model_number    |                      | [user input]                |      |      | user  |




### Inverter

#### Input

The following information is taken from the manufacturer specification sheet. In our online express design application, this information is stored in FSEC's database.

| Description                                                        | Symbol                      | Unit |
|:-------------------------------------------------------------------|:----------------------------|:-----|
| UL1741 listed/FSEC approved?                                       | ul_1741                     |      |
| Maximum dc voltage, Vmax,inv (V)                                   | vmax                        | V    |
| MPPT minimum dc operating voltage (V)                              | mppt_min                    | V    |
| MPPT maximum operating voltage (V)                                 | mppt_max                    | V    |
| Min. dc operating voltage (V)                                      | voltage_range_min           | V    |
| Min. dc start voltage (V)                                          | vstart                      | V    |
| Maximum dc operating current per inverter input or MPP tracker (A) | imax_channel                | A    |
| Number of inverter inputs or MPP trackers                          | mppt_channels               |      |
| Maximum OCPD Rating (A)                                            | max_ac_ocpd                 | A    |
| Imax total                                                         | imax_total                  |      |
| Imax per MPPT channel                                              | imax_channel                |      |
| Max DC input power 120                                             | max_dc_inputpower_120       |      |
| Max DC input power 208                                             | max_dc_inputpower_208       |      |
| Max DC input power 240                                             | max_dc_inputpower_240       |      |
| Max DC input power 277                                             | max_dc_inputpower_277       |      |
| Max DC input power 480                                             | max_dc_inputpower_480       |      |
| Nominal AC output power 120                                        | nominal_ac_output_power_120 |      |
| Nominal AC output power 208                                        | nominal_ac_output_power_208 |      |
| Nominal AC output power 240                                        | nominal_ac_output_power_240 |      |
| Nominal AC output power 277                                        | nominal_ac_output_power_277 |      |
| Nominal AC output power 480                                        | nominal_ac_output_power_480 |      |
| Max AC output current 120                                          | max_ac_output_current_120   |      |
| Max AC output current 208                                          | max_ac_output_current_208   |      |
| Max AC output current 240                                          | max_ac_output_current_240   |      |
| Max AC output current 277                                          | max_ac_output_current_277   |      |
| Max AC output current 480                                          | max_ac_output_current_480   |      |
Note: These fields perpended with "inverter." in code.

The following is provided by the user:

| Description  | Symbol       | Unit |
|:-------------|:-------------|:-----|
| Grid voltage | grid_voltage | V    |

#### Calculations

If max_ac_ocpd is not provided by the manufacturer, it is calculated as follows:

AC_OCPD_max = max_ac_output_current * 1.25

The nominal_ac_output_power is selected from fields based on the user selected grid voltage. As an example, if the user selects 240 VAC, then:

  nominal_ac_output_power = nominal_ac_output_power_240
  max_ac_output_current = max_ac_ouput_current_240

#### Computer code

    inverter.AC_OCPD_max = sf.if( sf.not( inverter.max_ac_ocpd ), inverter.max_ac_output_current * 1.25, inverter.max_ac_ocpd );
    inverter.nominal_ac_output_power = inverter['nominal_ac_output_power_'+inverter.grid_voltage];
    inverter.max_ac_output_current = inverter['max_ac_ouput_current_'+inverter.grid_voltage];
