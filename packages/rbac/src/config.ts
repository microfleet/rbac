import conf from 'ms-conf';
import path from 'path';

conf.prependDefaultConfiguration(path.resolve(__dirname, './configs'));

export = conf;
