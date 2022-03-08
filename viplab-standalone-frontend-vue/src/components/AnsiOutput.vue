<template>
    <div class="ansi-output-component">
        <div class="ansi-editor d-flex flex-row">
            <div class="line-numbers-div text-center" :id="divId+'-lines'"></div>
            <div class="console-output pl-1 pr-1" :id="divId+'-content'"></div>
        </div>
    </div>
</template>

<script>
var AU = require('ansi_up');

export default {
    name: "AnsiOutput",
    props: {
        divId: String,
        content: String
    },
    methods: {
        setAnsiOutput: function() {
            let ansi_up = new AU.default;

            //var txt  = "\n\n\x1B[1;33;40m 33;40  \x1B[1;33;41m 33;41  \x1B[1;33;42m 33;42  \x1B[1;33;43m 33;43  \x1B[1;33;44m 33;44  \x1B[1;33;45m 33;45  \x1B[1;33;46m 33;46  \x1B[1m\x1B[0\n\n\x1B[1;33;42m >> Tests OK\n\n"
            //var txt= "\u001b[31mHelloWorld";

            
            let lines = this.content.split(/\r?\n/);
            lines = lines.filter(function (el) {
                return el != null //&& el !== "" && el !== " ";
            });

            for (let line in lines) {
                let html = ansi_up.ansi_to_html(lines[line]);
                let cdiv = document.getElementById(this.divId+"-content");
                cdiv.innerHTML +=  "<span>" + html + "<br> </span>";
                let linesdiv = document.getElementById(this.divId+"-lines");
                let linenumber = parseInt(line) + 1;
                linesdiv.innerHTML +=  linenumber + "<br>";
            }
            
        }
    },
    mounted() {
        this.setAnsiOutput();
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ansi-output-component {
    height: 250px;
    font-family: Consolas;
    font-size: inherit;
    line-height: 2;
    border: 1px solid #ddd;
    background-color: #f3f2f3;
    color: rgba(15, 0, 9, 1.0);
    overflow: auto;
}

.ansi-editor {
    align-items: stretch;
}

.line-numbers-div {
    min-width: 43px;
    max-width: 43px;
    color: #333;
    background: #e8e8e8;
    background-color: rgb(232, 232, 232);
    cursor: default;
}

.console-output {
    white-space: nowrap;
}
</style>