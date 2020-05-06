fn fact(n: number) {
    if (n <= 1) {
        return 1;
    }
    return fact(n - 1)
}