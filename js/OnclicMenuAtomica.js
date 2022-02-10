<script type="text/javascript">
    function changeClass(){
document.getElementById("MyElement").classList.add('MyClass');

document.getElementById("MyElement").classList.remove('MyClass');

if ( document.getElementById("MyElement").classList.contains('MyClass') )

document.getElementById("MyElement").classList.toggle('MyClass');
    }
</script>
...
<button onclick="changeClass()">My Button</button>