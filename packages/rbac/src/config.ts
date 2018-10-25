import conf = require('ms-conf')
import path = require('path')

conf.prependDefaultConfiguration(path.resolve(__dirname, './configs'))

process.env.NCONF_NAMESPACE = process.env.NCONF_NAMESPACE || 'RBAC'

export default conf
