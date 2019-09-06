var args = process.argv;

if (args[2] == null) {
    console.log('\n ExtraerPAK v1.0 CLI https://github.com/alainazpe/ExtraerPAK-CLI\n\n   Uso: ExtraerPAK-CLI.exe "rutaArchivoPAK" "RutaExtracción"\n\n   Ejemplos:\n\n      1: Listar sus archivos: ExtraerPAK-CLI.exe "C:\\Varios\\varios.pak"\n      2: Listar y extracción rápida: ExtraerPAK-CLI.exe "C:\\Varios\\varios.pak" Auto\n      3: Listar y extracción en ruta: ExtraerPAK-CLI.exe "C:\\Varios\\varios.pak" "c:\\MisFicheros\\"')
process.exit(0)}

console.log('\n ExtraerPAK v1.0 CLI https://github.com/alainazpe/ExtraerPAK-CLI');

var fs = require('fs');

fs.readFile(args[2],"utf8",function (err, enASCII) {

    if (err) {
        console.log("\n Error al procesar la ruta del archivo PAK.\nRecuerda que la ruta debe ir entre comillas.")
        process.exit(1);
    };

    global.enASCII = enASCII;

});

fs.readFile(args[2],  "hex",function (err, data) {
    if (err) throw err;
    global.data = data;
    procesarFichero();
});

     
procesarFichero = function() {

    var path = require('path');
    var file = args[2];

    var filename = path.parse(file).base;

    global.rutaPAK = args[2]; // C:\pak\varios00.pak
    global.nombrePAK =  path.parse(file).base; // varios00.pak

    global.nombrePAKSinExtension = path.parse(file).name; // varios00
    global.rutaCarpetaPAK = global.rutaPAK.split(global.nombrePAK)[0]; // C:\pak\
    
    if (args[3] == "Auto"){
        global.rutaExtraccion = global.rutaCarpetaPAK + global.nombrePAKSinExtension; // C:\pak\varios00
    }

    if (args[3] !== "Auto" && args[3]){
        global.rutaExtraccion = args[3];
    }

    var valor = global.data; //Dame el archivo PAK en forma hexadecimal

    //Comprobamos si es un PAK válido
    comprobacionA  = valor.substring(0,6);
    comprobacionB  = valor.substring(10,12);

    if ( comprobacionA == "50414b" && comprobacionB == "03" || comprobacionA == "50414b" && comprobacionB == "02")  { 
    } else {
        console.log("Este fichero no es un .PAK compatible.");
        process.exit(1);
    }
      
    valor  = valor.substring(12,this.length); //Quitame cabecera extensión PAK, y enseña la lista archivos + archivos en sí
    valor = valor.split("789c")[0]; //Dejame sin los archivos en sí (corta hasta el "xoe"), solo quiero la lista

    //Trabajamos sobre la lista de archivos

    enBucle = false;

    numPuntos = parseInt(valor.substring(0,2), 16); 
    numFicheros = numPuntos;
    valor  = valor.substring(2,this.length);
    
    while (numPuntos > 0)  {

        if (enBucle == true){
            
            sinEncontradoPrevio = valor.substring(encontrado.length + separador.length, this.length)
            encontradoPrevio = valor.substring(0,encontrado.length + separador.length)  

            longitudHEX = parseInt(sinEncontradoPrevio.substring(0,2), 16);
            longitudFileName = 2 * longitudHEX;

            sinEncontradoPrevio = sinEncontradoPrevio.substring (2,this.length);

            encontrado = (encontradoPrevio + sinEncontradoPrevio.substring(0, longitudFileName));
            
            valor = encontrado + separador + sinEncontradoPrevio.substring((longitudFileName+16),this.length);

        } else { 

            longitudHEX = parseInt(valor.substring(0,2), 16);
            longitudFileName = 2 * longitudHEX;
            valor = valor.substring (2,this.length);

            encontrado = valor.substring(0, longitudFileName);

            separador = "5c6e"; // Esto es \n en hexadecimal

            encontradoPrevio = encontrado + separador;

            valor = encontradoPrevio + valor.substring((longitudFileName+16),this.length);
            
            enBucle = true;
        }

        //alert("numPuntos es " + numPuntos + ", baja uno")
        numPuntos--;
    } 

    function hex_to_ascii(str1)
    {
        var hex  = str1.toString();
        var str = '';
        for (var n = 0; n < hex.length; n += 2) {
            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }
        return str;
    }
    valor = hex_to_ascii(valor);

    if (numFicheros == 1) {numFicherosPlural = ""} else {numFicherosPlural = "s"}

    valor = valor.split('\\n');

    valor.splice(-1,1);

    infoListaFicheros = "\n " + global.nombrePAK + " contiene " + numFicheros + " archivo" + numFicherosPlural + ":";

    console.log(infoListaFicheros)

    numeroRecuento = 0;

    valor.forEach(function () {

      console.log('\n  - ' + valor[numeroRecuento++])

    });

    //Fin procesado nombre de archivos
    console.log('\n :::::::::::::::::::::::::::::::::::');

    if (!args[3]){
        // El usuario solo quiere listar los ficheros 
        console.log('\n Listados los archivos del PAK, fin de la tarea');
        console.log('\n :::::::::::::::::::::::::::::::::::');
        process.exit(0);
        } else {
        console.log('\n Listados los archivos del PAK, ahora los extraeeremos en ' + global.rutaExtraccion);
    }

    // El usuario decide extraer el fichero

    //Ruta offzip
    var nwPath = process.execPath;
    global.rutaExtractorHEX = path.dirname(nwPath) + "/JS/offzip.exe";

    // Variable global JS           Valor que devuelve          

    // global.rutaPAK               C:\pak\varios00.pak        
    // global.nombrePAK             varios00.pak               
    // global.nombrePAKSinExtension varios00                   
    // global.rutaCarpetaPAK        C:\pak\                   
    // global.rutaExtractorHEX      ???/JS/offzip.exe    
    // global.rutaExtraccion        C:\pak\varios00

   
    // Llamaremos a esta función cuando el usuario quiere extraer el fichero
    crearCarpeta = function(){
        try {
            fs.mkdirSync(global.rutaExtraccion);
        } catch (err) {
            if (err.code === 'EPERM') { 
                console.log('\n ERROR: Necesito elevación (privilegios admin.) para crear la carpeta: \n\n' + global.rutaExtraccion);
                process.exit(1);
            } 
        }
    }

    if (!fs.existsSync(global.rutaExtraccion)){

        console.log("\n Creando carpeta " + global.rutaExtraccion);
        crearCarpeta();

    } else if (global.rutaExtraccion !== args[3]) {

        console.log("\n ERROR: Contenido no extraido: El directorio " + global.nombrePAKSinExtension + " ya existe en la misma carpeta del archivo PAK.");
        process.exit(4);
        
    } else {

        console.log("\n ERROR: Contenido no extraido: El directorio existe: " + global.rutaExtraccion);
        process.exit(4);
        
    }     

        //Llamamos a offzip
    
        console.log("\n Procedemos a la extracción de " + global.nombrePAK + ", espere...");

        global.offzipInfo = (`cmd.exe /c 'offzip.exe -a -o -z 15 -m 1 -q '` + global.rutaPAK + `' '` + global.rutaExtraccion + `''` );
        global.offzipInfo = global.offzipInfo.replace(/'/g, '"');
        
        // No cerrar la linea de comandos : 
        // var child = spawn("cmd.exe",  ['/k', global.offzipInfo], {

        var spawn = require('child_process').spawnSync;
        var child = spawn(global.offzipInfo, {
            detached: true,
            shell: true
        });

        //Renombramos los ficheros
        console.log('\n Extraidos los archivos del PAK, ahora los renombraremos');
        numeroLista = 0;
        //passsing directoryPath and callback function
        fs.readdir(global.rutaExtraccion, function (err, files) {
            //handling error
           if (err) {
              return console.log('\n ERROR: No puedo leer los ficheros: ' + err);
           } 
            //listing all files using forEach
          files.forEach(function (file) {
                // Do whatever you want to do with the file
              
                fs.rename((global.rutaExtraccion + "\\" + file), (global.rutaExtraccion + "\\" + valor[numeroLista++]), function(err) {
                    if ( err ) console.log('\n ERROR: ' + err);
                });

            });
        });

        console.log('\n Renombrados los archivos del PAK, fin de la tarea');
        console.log('\n :::::::::::::::::::::::::::::::::::');
    }
