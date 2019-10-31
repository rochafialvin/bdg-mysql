let one = () => {
    return () => {
        console.log('Do Something')

        return () => {
            console.log('Another thing')
        }
    }
}
//  one()()()

let two = () => {

    return {
        sayHello : () => {
            console.log('Hellooooo ...')
        }
    }

}

two().sayHello()

// let hasil = two()
// hasil.sayHello()

