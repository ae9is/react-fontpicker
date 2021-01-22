<template>
  <div id="app">
    <h1>Simple google font picker</h1>
    <p>
      This is a live demo showing how to use @mikk3lro/mc-fontpicker for Vue.js.
    </p>
    <p>
      See
      <a href="https://github.com/Mikk3lRo/vue-fontpicker#readme"
        >github repo</a
      >
      or
      <a href="https://www.npmjs.com/package/@mikk3lro/mc-fontpicker"
        >npm package</a
      >
      for installation instructions.
    </p>

    <div id="toc">
      <h3>TOC</h3>
      <ul>
        <li><a href="#default">Default behaviour</a></li>
      </ul>
    </div>

    <h3 id="default">Default behaviour</h3>
    <div class="example">
      <a href="#">Before</a>
      <McFontpicker v-model="font1" />
      <a href="#">After</a>
    </div>
    <pre>&lt;McFontpicker v-model="font1" /></pre>
    <pre>Current value: {{ font1 }}</pre>
  </div>
</template>

<script>
import McFontpicker from './components/McFontpicker'

export default {
  name: 'App',
  components: {
    McFontpicker,
  },
  data() {
    return {
      font1: 'Tenor Sans',
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 1em auto 160px auto;
  max-width: 600px;
  text-align: left;
  padding: 1em 0.5em;
  line-height: 1.6em;
}
* {
  vertical-align: baseline;
  box-sizing: border-box;
}
a {
  color: #379bff;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
#toc {
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.3);
  position: fixed;
  width: 220px;
  top: 40px;
  left: calc(50% - 550px);
  padding: 1em 0;
}
#toc li {
  padding: 0.2em 0.5em;
  margin: 0;
  text-align: center;
}
#toc h3 {
  border-bottom: 1px solid #888;
  margin: 0 0 0.5em 0;
  text-align: center;
}
#toc ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
@media screen and (max-width: 1100px) {
  #app {
    margin-left: 230px;
    max-width: none;
  }
  #toc {
    left: 0;
    top: 0;
    bottom: 0;
    transform: none;
  }
}
@media screen and (max-width: 600px) {
  #app {
    margin-left: auto;
  }
  #toc {
    display: none;
  }
}

h3 {
  margin-top: 50px;
  border-bottom: 3px solid #123456;
}

li {
  margin: 1em 0;
}

.example {
  text-align: center;
  position: relative;
}
.example.overflow {
  overflow: scroll;
  padding: 1em 0;
  border: 1px solid;
}
pre,
code {
  text-align: left;
  background: #eee;
}
table {
  margin: 0 auto;
  vertical-align: top;
  table-layout: fixed;
}
table th,
table td {
  vertical-align: top;
  padding: 0.5em;
  width: 45%;
}
table td:nth-child(2) {
  width: 10%;
  text-align: center;
}
table th {
  text-align: right;
  font-weight: normal;
}
table td {
  text-align: left;
}
table code {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
table pre,
table code {
  margin-top: 3px;
  display: inline-block;
  max-width: 100%;
}
.squarePreview {
  width: 100px;
  height: 2em;
}
.inputPreview {
  border: none;
  padding: 0;
  border-radius: 1em;
  height: 2em;
  text-align: center;
  width: 100px;
}
pre {
  padding: 0.5em;
  overflow-x: auto;
}
.initial-current {
  width: 100%;
}
.initial-current pre {
  width: 100%;
  margin: 0;
}
@media screen and (max-width: 500px) {
  .initial-current thead {
    display: none;
  }
  .initial-current th,
  .initial-current td,
  .initial-current tr {
    width: auto !important;
    display: block;
    text-align: center;
  }
  .initial-current th:first-child::before {
    content: 'Initial: ';
    display: block;
  }
  .initial-current td:last-child::before {
    content: 'Current: ';
    display: block;
  }
  .initial-current td:last-child {
    border-bottom: 1px solid #333;
  }
}
</style>
