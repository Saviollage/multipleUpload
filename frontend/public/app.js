let bytesAmount = 0;
const API_URL = 'http://localhost:3000';
const ON_UPLOAD_EVENT = 'file-uploaded'
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || !decimals || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i])
}
const updateStatus = (size) => {
    const text = `Pending bytes to upload: <strong>${formatBytes(size)}</strong>`
    document.getElementById("size").innerHTML = text;
}
const showSize = () => {
    const { files: fileElements } = document.getElementById('file')
    if (!fileElements || fileElements.lenght === 0) return;
    const files = Array.from(fileElements)
    const { size } = files.reduce((prev, next) => ({ size: prev.size + next.size }), { size: 0 })
    console.log(`Size: ${size}`)
    bytesAmount = size
    updateStatus(size)
}
const updateMessage = (message) => {
    const msg = document.getElementById('msg')
    msg.innerText = message;
    msg.classList.add('alert', 'alert-success')
    setTimeout(() => {
        msg.hidden = true
    }, 3000)

}
const showMessage = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const serverMessage = urlParams.get('msg')
    if (!serverMessage) return;
    updateMessage(serverMessage)
}
const configureForm = (targetURL) => {
    const form = document.getElementById("form")
    form.action = targetURL
}
const onLoad = () => {
    showMessage()
    const ioClient = io.connect(API_URL, { withCredentials: false })
    ioClient.on('connect', (msg) => {
        console.log('Connected!', ioClient.id)
        const targetURL = API_URL + `?socketId=${ioClient.id}`
        configureForm(targetURL)
    })
    ioClient.on(ON_UPLOAD_EVENT, (bytes) => {
        console.log("Recived", bytes)
        bytesAmount = bytesAmount - bytes;
        updateStatus(bytesAmount)
    })

    updateStatus(0)
}
window.onload = onLoad
window.showSize = showSize 