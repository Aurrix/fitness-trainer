import fs from 'node:fs'

export function selectedVersion(directory, fallback='video-v1') {
 const file=directory+'/job.json'
 const version=(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')).outputVersion:null)??fallback
 if(typeof version!=='string'||!/^video-v[1-9]\d*$/.test(version))throw Error('Invalid media version in '+directory)
 return version
}
