const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const filePath = 'data.xlsx'; // Path to your Excel file

app.use(express.static('public'));

const readExcelFile = () => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
};

io.on('connection', (socket) => {
    console.log('New client connected');

    // Send initial data
    socket.emit('updateData', readExcelFile());

    // Watch for changes in the Excel file
    fs.watchFile(filePath, (curr, prev) => {
        console.log('File changed');
        socket.emit('updateData', readExcelFile());
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
