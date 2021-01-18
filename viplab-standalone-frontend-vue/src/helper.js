let ws;
let files;
let template;

document.addEventListener("DOMContentLoaded", function(){
			
	template = JSON.parse(Base64.decode(document.querySelector(
			'#app').getAttribute('data-template')));
	//console.log(template);
	//additionalFields(template);
	//template.files.forEach(inputfile => buildInputFile(inputfile)); 
    let token = document.querySelector('#app').getAttribute('data-token');
    ws = new WebSocket("ws://localhost:8083/computations");
    ws.onopen = () => {
    	ws.send(JSON.stringify({"type":"authenticate","content":{"jwt":token}}));
        document.getElementById("submit").disabled = false;
    };
    ws.onmessage = function(event) {
        data = JSON.parse(event.data)
        switch  (data.type) {
            case "computation":
                console.log("computation: " + data.content);
                displayComputation(data.content);
                break;
            case "result":
                console.log("result: " + data.content);
                displayResult(data.content);
                break;
            default:
                console.error(data);
        }
    }
    document.getElementById("submit").onclick = senddata;
	
});

function uuid() {
	function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	}
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
}

function senddata() { 
    document.getElementById("submit").disabled = true;
    task = {
        "type":"create-computation",
        "content":{
            "template":document.querySelector('#app').getAttribute('data-template'),
            "task":{
                "template":template.identifier,
                "identifier":uuid(),
                "files": []
            }
            
        }
    };
    document.querySelectorAll('.file').forEach(function(filediv){
    	let file = { 'identifier': filediv.id, 'parts': []};
    	filediv.querySelectorAll('.partcontent').forEach(function(partcontent){
            //console.log(partcontent);
    		file.parts.push({'identifier':partcontent.id, 'content':Base64.encode(partcontent.value)});
    	});
    	task.content.task.files.push(file)
    });
    document.querySelector('#stdout').value = '';
    document.querySelector('#stderr').value = '';
    document.getElementById("fileList").innerHTML = '';
    files = new Map();
    ws.send(JSON.stringify(task));
    return false;
}

function displayComputation(computation) {
    //console.log(computation)
}

function displayResult(result) {
    console.log(result)
    document.querySelector('#stdout').value += Base64.decode(result.result.output.stdout);
    if ("final" == result.result.status) {
        document.getElementById("submit").disabled = false;
    }
    files = new Map();
    result.result.files.forEach(file => {
        var linode = document.createElement("li");
        var anode = document.createElement("a");
        anode.setAttribute('href', '#');
        anode.addEventListener("click",function() { return save(file.path,file.identifier,file.MIMEtype)});
        var textnode = document.createTextNode(file.path);
        anode.appendChild(textnode);
        linode.appendChild(anode);
        document.getElementById("fileList").appendChild(linode);
        files[file.identifier] = Base64.decode(file.content);
    });
}

function save(filename, identifier, mimetype) {
    var blob = new Blob([files[identifier]], {mimetype: mimetype});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
    return false;
}