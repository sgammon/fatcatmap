
// ~~~~~~~~~~~~ //
// ~~  MAIN  ~~ //
// ~~~~~~~~~~~~ //

// ~~ dart ~~ //
import 'dart:js';
import 'dart:html';

// ~~ deps ~~ //
import 'd3.dart';
import 'mapper/mapper.dart';

void main() {
  querySelector('#brand')
    ..text = d3().toString();
}
