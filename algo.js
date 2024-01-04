// Logic in Disk Schedules
//Initialize the inputs of the user and others
let tracks = document.querySelector('#tracks');
let head = document.querySelector('#head');
let max_tracks = document.querySelector('#max-track');
let algo = document.querySelector('#schedule');
let simulate = document.querySelector('#simulate-button');
let seektime = document.querySelector('#seekTime');

//Sample Data
// 118 59 110 25 105 63 100 28 80
// 70,118,59,110,25,105,63,100,28,80

//Results: Movement of the head and total seek time 
// sstf -> [70, 63, 59, 80, 100, 105, 110, 118, 28, 25] 163
// scan -> [70, 80, 100, 105, 110, 118, 199, 63, 59, 28, 25] 303
// c_look -> [70, 80, 100, 105, 110, 118, 25, 28, 59, 63] 179

let convert_array = () => {
    const value = tracks.value; // Assuming 'tracks' is an input element
    const array_of_strings = value.split(' '); // Split the string into an array of strings
    const array_of_numbers = array_of_strings.map(Number); // Convert each string to a number

    // Generate dynamic labels based on the number of inputs
    const dynamicLabels = array_of_numbers.map((_, index) => `Track ${index + 1}`);
    dynamicLabels.unshift('Disk Head'); //Add the disk head label at the beginning of the array
    
    return {array_of_numbers , dynamicLabels}; 
}

const sstfDiskScheduling = (requests, initialHeadPosition) => {
    let remainingRequests = [...requests];
    let totalSeekCount = 0;
    let headMovement = [];
    let currentHeadPosition = initialHeadPosition;
    while (remainingRequests.length > 0) {
        let nearestRequest = remainingRequests.reduce((nearest, request) =>
            Math.abs(request - currentHeadPosition) < Math.abs(nearest - currentHeadPosition) ? request : nearest
        );
        let seekDistance = Math.abs(nearestRequest - currentHeadPosition);
        totalSeekCount += seekDistance;
        headMovement.push(currentHeadPosition);
        currentHeadPosition = nearestRequest;
        remainingRequests = remainingRequests.filter(request => request !== nearestRequest);
    }
    headMovement.push(currentHeadPosition);
    return { totalSeekCount, headMovement };
}

//Checked
const C_Look = (head, request) => {
    let sortedRequests = [...request].sort((a, b) => a - b);
    let requestOrder = [];
    let tracks = 0;
    let greater = sortedRequests.filter(req => req >= head);
    let less = sortedRequests.filter(req => req < head);

    requestOrder.push(head);
    requestOrder.push(...greater);
    requestOrder.push(...less);

    for (let req = 0; req < requestOrder.length - 1; req++) {
        let count = Math.abs(requestOrder[req + 1] - requestOrder[req]);
        tracks += count;
    }
    return { requestOrder, tracks };
}

//Checked
const SCAN = (inputlist, mx, mn) => {
    let localList = [...inputlist];
    let SeekCount = 0;
    let sortedList = [localList.shift()]; 
    while (localList.length > 0) {
        let head = sortedList[sortedList.length - 1];
        let greaterThan = localList.filter(x => x > head).sort((a, b) => a - b);
        greaterThan.forEach(item => {
            if (localList.includes(item)) {
                localList.splice(localList.indexOf(item), 1);
            }
        });
        if (localList.length > 0 && !greaterThan.includes(mx)) {
            greaterThan.push(mx);
        }
        sortedList.push(...greaterThan);
        head = sortedList[sortedList.length - 1];
        let lesserThan = localList.filter(x => x <= head).sort((a, b) => b - a);
        lesserThan.forEach(item => {
            if (localList.includes(item)) {
                localList.splice(localList.indexOf(item), 1);
            }
        });
        if (localList.length > 0 && !lesserThan.includes(mn)) {
            lesserThan.unshift(mn);
        }
        sortedList.push(...lesserThan);
    }
    for (let index = 0; index < sortedList.length - 1; index++) {
        SeekCount += Math.abs(sortedList[index] - sortedList[index + 1]);
    }
    return { sortedList, SeekCount };
}


simulate.addEventListener('click', () => {
    let dataValue = convert_array();
    if (algo.value == 'sstf') {
        const { totalSeekCount, headMovement } = sstfDiskScheduling(dataValue.array_of_numbers, parseInt(head.value)) 
        myChart.data.datasets[0].data = headMovement;
        myChart.data.labels = dataValue.dynamicLabels
        myChart.options.scales.y.suggestedMax = max_tracks.value
        seektime.innerHTML = totalSeekCount;
        myChart.update()
    }
    else if (algo.value == 'scan') {
        dataValue.array_of_numbers.unshift(parseInt(head.value))
        const { sortedList, SeekCount } = SCAN(dataValue.array_of_numbers, parseInt(max_tracks.value), 0) 
        myChart.data.datasets[0].data = sortedList;
        myChart.data.labels = dataValue.dynamicLabels
        myChart.options.scales.y.suggestedMax = max_tracks.value
        seektime.innerHTML = SeekCount;
        myChart.update()
    }
    else if (algo.value == 'c-look') {
        const { requestOrder, tracks } = C_Look(parseInt(head.value), dataValue.array_of_numbers) 

        myChart.data.datasets[0].data = requestOrder;
        myChart.data.labels = dataValue.dynamicLabels
        myChart.options.scales.y.suggestedMax = max_tracks.value
        seektime.innerHTML = tracks;
        myChart.update()
    }
})

// Sample data for Graph
var data = {
    labels: ['Sample Data', 'Sample Data_2'],
    datasets: [{
      label: 'Disk Scheduling Algorithms',
      data: [4, 2],
      backgroundColor: 'cyan',
      borderColor: 'red'
    }]
  };

  // Configuration options
  var options = {
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 1)',  // Set the color of x-axis grid lines
          borderColor: 'rgba(255, 255, 255, 1)',  // Set the color of x-axis border
          borderWidth: 1,  // Set the width of x-axis border
          borderDash: [5, 5],  // Set the style of x-axis border (dashed in this case)
        },
        ticks: {
            min: parseInt(head.value), //Set the 
            color: 'white' //Set the color of the x-axis label
        },
        title: {
            display: true,
            text: 'Tracks',  // This is the x-axis label
            color: 'white' // Set the color of the x-axis label
          }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 1)',  // Set the color of y-axis grid lines
          borderColor: 'rgba(255, 255, 255, 1)',  // Set the color of y-axis border
          borderWidth: 1,  // Set the width of y-axis border
          borderDash: [5, 5],  // Set the style of y-axis border (dashed in this case)
        },
        ticks: {
          color: 'white', //Set the color of the y-axis label
        },
        title: {
            display: true,
            text: 'Disk',  // This is the x-axis label
            color: 'white' // Set the color of the x-axis label
          },
        suggestedMax: 100
      }
    }
  };
  // Get the context of the canvas element
  var context = document.getElementById('myChart').getContext('2d');

  // Create a bar chart
  var myChart = new Chart(context, {
    type: 'line',
    data: data,
    options: options
  });