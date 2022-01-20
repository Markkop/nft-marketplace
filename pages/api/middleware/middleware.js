import nextConnect from 'next-connect'
import multiparty from 'multiparty'

const middleware = nextConnect()

middleware.use((req, res, next) => {
  const form = new multiparty.Form()
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log(err)
      next()
    }
    req.body = fields
    req.files = files
    next()
  })
})

export default middleware
