class Producto
{
    constructor(id, nombre, precio, stock, categoria)
    {
        this.id = id
        this.nombre = nombre
        this.precio = precio
        this.stock = stock
        this.categoria = categoria
    }
}

let listadoProductos = []

let id = listadoProductos.length + 1

//cargar archivo json de manera asincronica
fetch('db.json')
    .then(response => response.json())
    .then(productos => {
        productos.forEach(producto => {
            //si el producto nuevo no esta en la lista
            if(!(listadoProductos.some(p => p.nombre === producto.nombre && p.precio == producto.precio)))
            {
                //Agrego a lista
                listadoProductos.push(new Producto(listadoProductos.length+1, producto.nombre, producto.precio, producto.stock, producto.categoria))
                //agrego al storage
                localStorage.setItem('productos', JSON.stringify(listadoProductos))
            }
        })
        listaProductosMostrar(listadoProductos, listaProductosOrdenar(listaProductosMostrar))    
        id = listadoProductos.length + 1
    })
    
//CARGAR LOCAL STORAGE
localStorage.getItem('productos') ? listadoProductos = JSON.parse(localStorage.getItem('productos')) : localStorage.setItem('productos', JSON.stringify(listadoProductos))

function listaProductosMostrar(lista, f=false) //f=false: Si no paso ninguna funcion como parametro, solo imprimira el array
{
    if(f!==false)
    {
        f(lista)
    }

    divProductos.innerHTML = "" //para borrar si ya habia algo

    for(const p of lista)
    {
        
        //DESESTRUCTURACION OBJETO
        let {id : idCard} = p
        
        divProductos.innerHTML += `
        
            <div class="card ${idCard}" style="width: 16rem; height: 13rem;" >
                <div class="card-body">
                    <h5 class="card-title">${p.nombre}</h5>
                    <p class="card-text" style="position: absolute; bottom: 90px;">Precio: $ ${p.precio}</p>
                    <p class="card-text" style="position: absolute; bottom: 70px;">Cantidad: ${p.stock}</p>                           
                    <p><footer class="blockquote-footer" style="position: absolute; bottom: 40px;">${p.categoria}</footer></p>
                    <p><button id="btnEliminar" href="#" class="btnEliminar btn-danger" style="position: absolute; bottom: 15px;">Eliminar</button></p>
                </div>
            </div>`

        //Agregar evento al boton ELIMINAR creado
        var btnEliminar = document.getElementsByClassName("btnEliminar btn-danger");

        for (let i=0; i < btnEliminar.length; i++) 
        {    
            let index = i //tuve que declarar la variable index porque dentro de la funcion del evento click no me tomaba i

            btnEliminar[i].addEventListener('click', (e) => {
            //SWEET ALERT
                Swal.fire({
                    title: `¿Esta seguro de que desea borrar el producto ${lista[index].nombre} del listado?`,
                    text: "Su producto sera eliminado definitivamente del inventario",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#000000',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si, Borrar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        lista.splice(index,1)
                        localStorage.setItem('productos', JSON.stringify(listadoProductos))
                        listaProductosMostrar(lista,)
                        Swal.fire({
                            title: '¡Producto eliminado!',
                            text: 'Tu producto fue eliminado del inventario',
                            icon: 'success',
                            confirmButtonColor: '#000000'
                        })
                    }
                })
            })
        }

    }
}

function listaProductosOrdenar(lista)
{
    let az = document.getElementById("a-z")
    az.addEventListener('click', () => {
        lista.sort((a,b) => 
        {
            if(a.nombre > b.nombre)
            {
                return 1
            }
            if(a.nombre < b.nombre)
            {
                return -1
            }
            return 0
        })
        
        listaProductosMostrar(lista,)    
    })

    let za = document.getElementById("z-a")
    za.addEventListener('click', () => {
        lista.sort((a,b) => 
        {
            if(a.nombre < b.nombre)
            {
                return 1
            }
            if(a.nombre > b.nombre)
            {
                return -1
            }
            return 0
        })
        
        listaProductosMostrar(lista,)    
    })

    let menorPrecio = document.getElementById("menorPrecio")
    menorPrecio.addEventListener('click', () => {
        lista.sort((a,b) => a.precio - b.precio)
        
        listaProductosMostrar(lista,)    
    })

    let mayorPrecio = document.getElementById("mayorPrecio")
    mayorPrecio.addEventListener('click', () => {
        lista.sort((a,b) => b.precio - a.precio)
        
        listaProductosMostrar(lista,)    
    })
}

function descargarPDF()
{
    //jsPDF
    const pdf = new jsPDF();
    
    pdf.text("LISTADO DE PRODUCTOS", 70, 10);
    pdf.setFontSize(8)
    let line = 20
    
    listadoProductos.forEach(producto => {
        pdf.text(`ID: ${producto.id}\nNOMBRE: ${producto.nombre}\nPRECIO: $ ${producto.precio}\nCANTIDAD: ${producto.stock}\nCATEGORIA: ${producto.categoria}`, 20, line)      
        line+=20
    });
    
    pdf.save("Inventario.pdf");
}

const lblMensaje = (mensaje) => document.getElementById("lblMensaje").innerHTML = mensaje

//DOM
const divProductos = document.getElementById("divProductos")
const formAgregar = document.getElementById("formAgregarProductos")
const formBusqueda = document.getElementById("formBusqueda")

listaProductosMostrar(listadoProductos, listaProductosOrdenar(listadoProductos))

//Buscar un producto por su nombre
formBusqueda.addEventListener('submit', (e) => {
    e.preventDefault()
    
    let inputBuscarNombre = document.getElementById("inputBuscarNombre")
    let listaB = listadoProductos.filter(producto => producto.nombre.includes(inputBuscarNombre.value))
    
    listaProductosMostrar(listaB, listaProductosOrdenar(listaB)) 
})

formAgregar.addEventListener('submit', (e) => {
    e.preventDefault()

    let inputNombre = document.getElementById('inputNombre')
    let inputPrecio = document.getElementById('inputPrecio')
    let inputStock = document.getElementById('inputStock')
    let inputCategoria = document.getElementById('inputCategoria')
    inputPrecio = parseFloat(inputPrecio.value)

    //validar precio
    if(isNaN(inputPrecio) || inputPrecio < 0) 
    {    
        lblMensaje("El precio del producto ingresado no es válido")      
    }

    //¿Qué pasa si el producto ya existe?
    else if(listadoProductos.some(producto => producto.nombre === inputNombre.value && producto.precio === inputPrecio))
    {
        lblMensaje("El producto ingresado ya existe")
    }

    //Agregar nuevo producto a la lista    
    else
    {    
        listadoProductos.push(new Producto(id++, inputNombre.value, inputPrecio, inputStock.value, inputCategoria.value))
        localStorage.setItem('productos', JSON.stringify(listadoProductos))
        lblMensaje("¡Producto agregado!")
   
        listaProductosMostrar(listadoProductos,)    
    }
})

//Reiniciar la lista despues de una busqueda
document.getElementById("btnHome").addEventListener('click', () => {
    listadoProductos.sort((a,b) => a.id - b.id) //volver a la lista original ordenada por id 
    listaProductosMostrar(listadoProductos, listaProductosOrdenar(listadoProductos))    
}) 

//Descargar informe con jsPDF
document.getElementById("btnPDF").addEventListener('click', () => {
    descargarPDF()
})
