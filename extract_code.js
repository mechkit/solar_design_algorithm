var fs = require('fs');
var path = require('path');

var code_check = /^\s+\S/;

var renderer = function(input_string){
  //var input = extract_metadata(input_string);

  if( input_string.trim() !== '' ){

    var lines = input_string.split('\n');

    var output_code_array = [];

    lines.forEach(function(line, i){
      var matches = code_check.exec(line);
      if( matches !== null) {
        //console.log(i, matches);
        output_code_array.push(line);
      }
    });


    var output_string = output_code_array.join('/n');

  } else {
    output_string = input_string;
  }

  return output_string;
};


var render_files = function(input_md_filename, output_code_filename){
  var in_dir = in_dir || '';
  var out_dir = out_dir || '';
  var input_path = path.resolve(__dirname, in_dir);
  var output_path = path.resolve(__dirname, out_dir);

  var input_file_path = path.resolve(input_path, input_md_filename);
  var input_string = fs.readFileSync(input_file_path, {encoding: 'utf8'});

  var output_string = renderer(input_string);

  var output_file_path = path.resolve(output_path, output_code_filename);
  fs.writeFileSync(output_file_path, output_string, {encoding: 'utf8'});
};



var args_array = [];
for( var i = 2; true; i++ ){
  var input = process.argv[i];
  if( input === undefined ){break;}
  args_array.push(input);
}

//console.log(args_array);

var input_md_filename = args_array[0];
var output_code_filename = args_array[1];


render_files(input_md_filename, output_code_filename);

module.exports = render_files;
