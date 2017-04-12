var path = require('path');

var args_array = [];
for( var i = 2; true; i++ ){
  var input = process.argv[i];
  if( input === undefined ){break;}
  args_array.push(input);
}

var input_filename = args_array[0];

var base_path = path.resolve(__dirname, '../');

var markdownpdf = require('markdown-pdf');

var preProcessHtml = function(input){
  console.log(input);
};

var options = {
  paperFormat: 'letter',
  paperBorder: '0.5in',
  //cssPath: 'style.css',
  cssPath: base_path + '/extract_code/style.css',
  //preProcessHtml: preProcessHtml,
  remarkable: {
    html: true,
    breaks: true,
    //plugins: [ require('remarkable-classy') ],
    syntax: [ 'footnote', 'sup', 'sub' ]
  }
};

markdownpdf(options)
  .from( base_path+'/'+input_filename )
  .to( base_path+'/'+input_filename+'.pdf', function (){
    console.log('Done');
  });
