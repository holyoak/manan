#!/usr/bin/env node
"use strict";
const gdaxStream = require('./gdax/gdax.auth.socket.js');
const gdaxParser = require('./gdax/gdax.parser.js');

const termkit = require( 'terminal-kit' );
const term = termkit.terminal;
const SB = termkit.ScreenBuffer;
const TB = termkit.TextBuffer;

// build containers for websocket streams
const gdaxDiv = SB.create(
  {
    dst: term ,
    height: 14,
    width: term.width/4,
    x: 4,
    y: 4
});
const gdaxStyle = { attr: { bgColor: 95 } };
gdaxDiv.fill( gdaxStyle );

const poloPage = SB.create(
  {
    dst: term ,
    height: 12,
    width: term.width/4,
    x: 8 + term.width/4,
    y: 4,
    attr: { bgColor: 56 }
});
const poloStyle = { attr: { bgColor: 18 } };
poloPage.fill( poloStyle );
poloPage.draw();


const gdaxPage = TB.create( { dst: gdaxDiv, forceInBound:1 } );
    gdaxPage.insert("Opening\nGDAX Websocket feed");
    gdaxPage.moveToEndOfLine();
    gdaxPage.newLine();
    gdaxPage.setAttrRegion( gdaxStyle );
    gdaxPage.draw();
    gdaxDiv.draw();




// send stream messages to text buffer
gdaxStream.addListener('message', function( data ) {
  if(data.user_id){console.log(data)}

  if(data.type == 'match'){
    let trades = gdaxParser.parse(data);
    let i = 1;
    gdaxPage.setText(trades[0].label);

    while(i<trades.length){
      gdaxPage.insert(trades[i].label);
      gdaxPage.moveToEndOfLine();
      gdaxPage.newLine();
      i++;
    }
// draw text buffer, then screen buffer
    gdaxPage.draw();
    gdaxDiv.draw();

  }
});
