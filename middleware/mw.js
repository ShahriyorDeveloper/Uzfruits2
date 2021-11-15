const mw = (req, res, next) => {
    if(req.isAuthenticated()){
        next()
    }else{
        req.flash("alert alert-danger", 'Avtorizatsiyadan utmagansiz')
        res.redirect('/adm/login')
    }
}

module.exports = mw