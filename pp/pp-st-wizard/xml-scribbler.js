
      var xml_tbox;
      var schema_win = null;
      var schema_text = 
         "<grammar xmlns='http://relaxng.org/ns/structure/1.0'>\
   <start>\
      <element name='book'>\
         <oneOrMore>\
            <ref name='page'/>\
         </oneOrMore>\
      </element>\
   </start>\
   <define name='page'>\
      <element name='page'>\
         <text/>\
      </element>\
   </define>\
</grammar>";


function handleOpenSchema(){
  schema_win = window.open("schema-scribbler.html", "schema-win");
}

      function handleOnLoad(){
          var xml_input = document.getElementById('xml_input');
          xml_tbox = CodeMirror.fromTextArea(xml_input, {
	         lineNumbers: true,
	         mode: "xml",
             hintOptions: {schemaInfo: tags},
              extraKeys: {
               "F11": handleValidateClick,
                 "'<'": completeAfter,
               "'/'": completeIfAfterLt,
               "' '": completeIfInTag,
               "'='": completeIfInTag,
               "Ctrl-Space": "autocomplete"
             },
	      });
          var sizeField = document.getElementById("sizeField");
          sizeField.value = "200";
          if (typeof(Storage) !== "undefined") {
              var prev_content = localStorage.getItem("xml_content");
              if (prev_content != null) xml_tbox.setValue(prev_content);
              var size =localStorage.getItem("codebox_size");
              if (size != null){
                    sizeField.value = size;
              }
          }
          xml_tbox.setSize("100%", sizeField.value+"px");         
      }
      function scrollCodeTo(num){
         xml_tbox.setCursor({line: num-1});
      }

      function handleSizeChange(){
          var siz = document.getElementById("sizeField").value;
          xml_tbox.setSize(null, siz);
          localStorage.setItem("codebox_size", siz);
      }


      function handleValidateClick(){
         var args = {};
	     args.xml=xml_tbox.getValue();
         localStorage.setItem("xml_content", args.xml);
         args.schema= schema_text;
         args.arguments =["--noout", "--relaxng", "schema", "text"];
         var results = validateXML(args);
         results = results.replace(/^text\:(\d+)\:/g, "<span class='linklike' onclick='scrollCodeTo($1)'>input:$1</span>: ")
         document.getElementById("output").innerHTML = results;
         
      }

      var dummy = {
        attrs: {
          color: ["red", "green", "blue", "purple", "white", "black", "yellow"],
          size: ["large", "medium", "small"],
          description: null
        },
        children: []
      };

      var tags = {
        "!top": ["top"],
        "!attrs": {
          id: null,
          class: ["A", "B", "C"]
        },
        top: {
          attrs: {
            lang: ["en", "de", "fr", "nl"],
            freeform: null
          },
          children: ["animal", "plant"]
        },
        animal: {
          attrs: {
            name: null,
            isduck: ["yes", "no"]
          },
          children: ["wings", "feet", "body", "head", "tail"]
        },
        plant: {
          attrs: {name: null},
          children: ["leaves", "stem", "flowers"]
        },
        wings: dummy, feet: dummy, body: dummy, head: dummy, tail: dummy,
        leaves: dummy, stem: dummy, flowers: dummy
      };
      function completeAfter(cm, pred) {
        var cur = cm.getCursor();
        if (!pred || pred()) setTimeout(function() {
          if (!cm.state.completionActive)
            cm.showHint({completeSingle: false});
        }, 100);
        return CodeMirror.Pass;
      }

      function completeIfAfterLt(cm) {
        return completeAfter(cm, function() {
          var cur = cm.getCursor();
          return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
        });
      }

      function completeIfInTag(cm) {
        return completeAfter(cm, function() {
          var tok = cm.getTokenAt(cm.getCursor());
          if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
          var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
          return inner.tagName;
        });
      }

