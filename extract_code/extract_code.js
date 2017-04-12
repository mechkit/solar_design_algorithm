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
        var whitespace_size = matches[0].length-1;
        var unindented_code_line = line.slice(whitespace_size);

        var code_line = '  ' + unindented_code_line;

        output_code_array.push(code_line);
      }
    });

    var output_string = output_code_array.join('\n');

  } else {
    output_string = input_string;
  }

  return output_string;
};


var render_files = function(input_md_filename, output_code_filename){
  var base_path = path.resolve(__dirname, '../');

  var input_file_path = path.resolve(base_path, input_md_filename);
  var input_string = fs.readFileSync(input_file_path, {encoding: 'utf8'});

  var output_string = renderer(input_string);

  var output_file_path = path.resolve(base_path, output_code_filename);
  var input_string_pre = fs.readFileSync( base_path + '/extract_code/' + output_code_filename+'.pre', {encoding: 'utf8'}) || '';
  var input_string_post = fs.readFileSync( base_path + '/extract_code/' + output_code_filename+'.post', {encoding: 'utf8'}) || '';
  output_string = input_string_pre + output_string + input_string_post;
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
