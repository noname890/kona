import ClassName from lib

class ExtendClass extends ClassName {
    constructor (public a) {
        super(a)
    }

    operator plus(left, right) {
        if (right instanceof ExtendClass) {
            return left.a + right.a
        }
        return left.a + right
    } 
}

let test = new ExtendClass(9)
let test2 = new ExtendClass(7)

console.log(test + test2) //16