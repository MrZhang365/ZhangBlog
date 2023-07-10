function $ (id) {
    return document.getElementById(id)
}

$('login').onclick = () => location.href = '/api/auth/login'