const puppeteer = require('puppeteer'); // importamos el modulo de puppeteer
const fs = require('fs'); // importamos el modulo file system de node para trabajar con el sist. de archivos de nuestra maquina

(async () => 
  {
    const browser = await puppeteer.launch({ headless: false}); // lanzamos el navegador, sin cabecera
    const page = await browser.newPage(); // creamos una nueva pagina
    await task(page, "https://www.sii.cl/servicios_online/1047-nomina_inst_financieras-1714.html", browser) // ejecutamos la funcion task con los parametros de la pagina y el navegador 
  })();

const task =  async (page, url, browser) =>
 {
    await page.goto(url); // navegamos a la pagina
    
    let tittleRow = []  // array para guardar los titulos de las columnas
    const tittle = await page.$eval("tr", element => element.innerHTML) // en la constante tittle guardamos elementos del dom con id "tr"
    tittleRow.push(tittle) // guardamos el titulo de la tabla en el array
    tittleRow = tittleRow[0].split("<th>").map(element => element.replace("</th>", "")).filter(element => element.length > 1)   // eliminamos los espacios en blanco y los titulos vacios
    
    // console.log(tittleRow) // mostramos los titulos de las columnas para verificar que esten correctos


    
    let dataFromSii = [] // array para guardar los datos de la tabla
    const values = await page.$eval("tbody", element => element.innerHTML)  // obtenemos el html de la tabla
    dataFromSii.push(values) // guardamos los datos de la tabla en el array
    dataFromSii = dataFromSii[0].split("<tr>") // separamos los datos de la tabla por filas
    for (let i = 0; i < dataFromSii.length; i++) 
      { // recorremos el array
          dataFromSii[i] = dataFromSii[i].split("</tr>")[0].split("<td>").filter(element => element != "").map(element => element.replace("</td>", ""))
      }  // eliminamos los espacios en blanco y los datos vacios
    dataFromSii.shift()  // eliminamos la primera fila de la tabla, que es el titulo de la tabla
    
    
    for (let i = 0; i < dataFromSii.length; i++) 
      {  // recorremos el array de datos
          let obj = {}  // creamos un objeto
          for (let j = 0; j < dataFromSii[i].length; j++) { // recorremos el array de datos de cada objeto
              obj[tittleRow[j]] = dataFromSii[i][j] // guardamos el valor en el objeto
          }
          dataFromSii[i] = obj // guardamos el objeto en el array
      }
     
     console.table(dataFromSii) // mostramos los datos de la tabla para verificar que esten correctos
   await browser.close() // cerramos el navegador
    fs.writeFileSync(`./data-from-sii/data-sii.json`, JSON.stringify(dataFromSii)) // guardamos el array en un archivo json, en el respectivo directorio
   
}