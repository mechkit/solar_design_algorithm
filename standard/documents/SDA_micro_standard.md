# Solar Design Algorithm

The document below defines the calculations used to design and evaluate a PV system in preparation for creating electrical drawings.

The secondary documents are automatically created from this source:

  * [A printable PDF document describing the algorithm, with no computer code](SDA_standard.pdf).
  * [Key computer code used in FSEC's online express drawing creation application](SDA.js).
  * [A printable PDF document describing the algorithm and it's related computer code](SDA.pdf).

Note: For each section, the symbols are pre-pended by a section name to assist with their use in the computer code, in the form of "section.symbol".

## Micro Inverter System Calculations

### Calculations

| Description                   | Symbol           | Calculation                                                 | Unit |
|:------------------------------|:-----------------|:------------------------------------------------------------|:-----|
| Maximum source/branch power   | source.max_power | module.pmp * array.largest_string                           | W    |
| Maximum source/branch current | source.current   | inverter.max_ac_output_current / 240 * array.largest_string | A    |
| Maximum array power           | array.pmp        | array.num_of_modules * module.pmp                           | W    |


### Inverter

The nominal_ac_output_power is selected from fields based on the user selected grid voltage. As an example, if the user selects 240 VAC, then:

nominal_ac_output_power = nominal_ac_output_power_240
max_ac_output_current = max_ac_ouput_current_240


If max_ac_ocpd is not provided by the manufacturer, it is calculated as follows:

AC_OCPD_max = max_ac_output_current * 1.25




### Array checks

The total array power must be less than 10,000W.


### Branch checks

The largest number of microinverters per branch must not exceed the maximum number allowed by the manufacturer.

  error_check.micro_branch_too_many_modules = array.largest_string > inverter.max_unitsperbranch;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.micro_branch_too_many_modules ){ report_error( 'The system has too many inverters per branch circuit.' );}
  
  error_check.micro_branch_too_few_modules = array.smallest_string < inverter.min_unitsperbranch;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.micro_branch_too_few_modules ){ report_error( 'The system has too many inverters per branch circuit.' );}

The total nominal module power output for each branch must not exceed the manufacturer's limit. 

  error_check.micro_branch_too_much_power = source.max_power > inverter.max_watts_per_branch;
  // If error check is true, flag system design failure, and report notice to user.
  if(error_check.micro_branch_too_much_power ){ report_error( 'The branch circuit power limit has exceeded the manufacturer's limit.' );}


### Module - Inverter checks

The module's operating voltage must be within the inverter's MPPT operating range. 

The module's operating voltage must be less than the inverter maximum operating current. 


The selected module can not have more cells than allowed by the inverter manufacturer.

### Conductor and conduit schedule

For string inverters, these are the circuit names:
* PV Microinverter AC sources

  
The maximum current and voltage for the array DC circuits are equal to source.isc and source.voc. 


The AC grid voltage is defined by system specifications (user input).


The number of AC conductors is defined by the conductors required by that AC voltage, multiplied by the number of branches in the array. 
Total conductors adds one more for the ground.



For each circuit, calculate the following.

The array maximum temperature of the array is equal to the 2% maximum temperature at the install location, or nearest weather station. 
For a state wide design, the largest maximum temperature for the state is used.
Rooftop array circuits also have a temperature adjustment defined above.

Minimum required current is 1.25 times the cicuit's max current:


For strings per MPP tracker of 2 or less, or for inverters with built in OCPD, additional DC OCPD is not required. The AC circuits do require OCPD at the panel.

Choose the OCPD that is greater or equal to the minimum required current.


Choose the conductor with a current rating that is greater than the OCPD rating from NEC table 310.15(B)(16). 
NEC chapter 9 table 8 provides more details on the conductor. For DC circuits, 10 AWG wire is used as a best practice. 

The NEC article 352 and 358 tables are used to find a conduit with a sufficient 40% fill rate to hold the total conductor size for all the conductors.



Select further wire details based on code requirements and best practices.

PV Microinverter AC sources:
* Conductor: 'DC+/DC-, EGC'
* Location: 'Conduit/Exterior'
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

