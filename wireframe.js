
const HandlebarsDirectory = require('handlebars-directory')
const recursive = require("recursive-readdir")
const fs = require('fs-extra')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const imageminGifsicle= require('imagemin-gifsicle')
const imageminSvgo= require('imagemin-svgo')
const emptyFolder = require('empty-folder')
const bs = require("browser-sync").create()
const argv = require('minimist')(process.argv.slice(2))

const templateFileType = 'html'
const sourceDir = 'src'
const buildDir = 'dist'
const supportedImageFormats = 'jpg,jpeg,png,gif,svg'

const standarizePath = (path) => {
    return path.replace(/\//g,'\\').replace(/.\//g,'.\\')
}

const clearDistFolder = (product) => {
    return new Promise((resolve, reject) => {
        const distPath = `${buildDir}/${product}`

        const cleanFolder =  () => {
            emptyFolder(distPath, false, (e) => {
                resolve()
                if (e.error || e.failed) {
                    reject(e)
                }
            })
        }

        fs.stat(distPath, (error) => {
            if (!error) {
                cleanFolder()
            } else {
                if (error.code === 'ENOENT') {
                    fs.mkdir(buildDir)
                        .then(fs.mkdir(distPath))
                        .then(cleanFolder)
                        .catch((e) => reject(e))
                } else {
                    reject(error)
                }
            }
        })
    });

}

const extractFilenameFromPath = (path, mode) => {
    const file = path.replace(/^.*[\\\/]/, '')
    const extension = path.match(/\.[^/.]+$/)[0]

    switch (mode) {
        case 'name':
            return  file.replace(extension,'')

        case 'extension':
            return extension.substring(1)

        case 'full':
        default:
            return file
    }
}


const destinationFolderPath = (path, withoutFilename) => {
    argv.resourceDirs.split(',').forEach((resPath) => {
        path = resPath ? path.replace(sourceDir + '\\' + argv.product + '\\' + standarizePath(resPath),'') : path
    })

    if (withoutFilename) {
        path = path.replace(extractFilenameFromPath(path, 'full'), '')
    }

    return buildDir + '\\' + argv.product + '\\' + path
}

const processAssets = (product) => {
    let workChain = []

    argv.resourceDirs.split(',').forEach((path) => {
        recursive(`${sourceDir}/${product}/${path}`, ([`*.${templateFileType}`]), (err, files) => {
            files.forEach((file) => {
                workChain.push(handleFile(file))
            })
        })
    })

    return Promise.all(workChain)
}

const handleFile = (file) => {
    if (!argv.noImageOptim && supportedImageFormats.indexOf(extractFilenameFromPath(file,'extension')) > -1) {
        return optimizeImage(file)
    } else if (extractFilenameFromPath(file,'extension') !== 'html') {
        return copyItem(file, destinationFolderPath(file))
    }
}

const copyItem = (source, dest) => {
    return new Promise((resolve, reject) => {
        fs.copy(source, dest, (err) => {
            if (err){
                reject(err)
            } else {
                resolve()
            }
        })
    })

}

const startWatchServer = (product) => {

    bs.init({
        server: buildDir + '/' + product,
        port: 3000,
        open: false,
        notify: false,
        files: [
            {
                match: ['src/' + product + '/*/*.html'],
                fn: (event, file) => {
                    console.info(`Partial ${extractFilenameFromPath(file, 'full')} changed, re-rendering all templates`)
                    processTemplates(product).then(() => {
                        bs.reload()
                    })
                }
            },
            {
                match: ['src/' + product + '/*.html'],
                fn: (event, file) => {
                    console.info(`Processing template ${extractFilenameFromPath(file, 'full')}`)
                    processTemplate(product, extractFilenameFromPath(file, 'full')).then(() => {
                        bs.reload()
                    })
                }
            },
            {
                match: ['src/' + product + '/**/*.!(html)'],
                fn: (event, file) => {
                    console.info(`Processing asset ${extractFilenameFromPath(file, 'full')}`)
                    handleFile(file).then(() => {
                        bs.reload()
                    })
                }
            }

        ]
    })
}

const optimizeImage = (file) => {
    return imagemin([file], destinationFolderPath(file, true), {
        plugins: [
            imageminMozjpeg({quality:94}),
            imageminPngquant({quality: '65-80'}),
            imageminGifsicle(),
            imageminSvgo()
        ]
    })
}


const handleError = (message) => {
    console.error(message)
    process.exit(1)
}

const parseTemplate = (product, filename) => {
    const renderView = HandlebarsDirectory((sourceDir + '/' + product), 'html')
    return renderView(filename, {title: argv.templateTitle || product})
}

const writeTemplate = (product, filename,contents) => {
    fs.writeFileSync(`${buildDir}\\${product}\\${filename}.html`, contents)
}

const processTemplate = (product, templateFile) => {
    return parseTemplate(product, templateFile.replace(templateFileType, ''))
        .then((renderedTemplate) => {
            writeTemplate(product, extractFilenameFromPath(templateFile,'name'), renderedTemplate)
        })
        .catch((err) => {
            handleError(err)
        })
}

const processTemplates = (product) => {
    return new Promise((resolve, reject) => {

        const productSourcePath = `${sourceDir}/${product}`

        if (!fs.lstatSync(productSourcePath).isDirectory()) {
            handleError('Invalid product/directory defined, check if it exists')
        }

        fs.readdir(productSourcePath,(err, templates) => {
            templates.forEach((template, i) => {
                if (template.indexOf(templateFileType) > -1) {
                    processTemplate(product, template)
                        .catch((err) => {
                            reject(err)
                        })
                        .finally(() => {
                            resolve()
                        })
                }
            })
        })

    })
}

(() => {

    if (!argv.product) handleError('No product defined!')
    if (!argv.resourceDirs) argv.resourceDirs = 'res'

    clearDistFolder(argv.product)
        .then(() => {

            processTemplates(argv.product)
                .then(processAssets(argv.product))
                .then(() => {
                    console.info(`Product ${argv.product} successfully built`)
                })
                .then(() => {
                    if (argv.watch) {
                        startWatchServer(argv.product)
                    }
                })
                .catch((err) => {
                    handleError(err)
                })
        })
})()
