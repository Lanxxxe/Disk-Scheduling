// Logic in Disk Schedules
let tracks = document.querySelector('#tracks');
let head = document.querySelector('#head');
let max_tracks = document.querySelector('#max-track');
let algo = document.querySelector('#schedule');
let simulate = document.querySelector('#simulate-button');
let seektime = document.querySelector('#seekTime');


let convert_array = () => {
    const value = tracks.value; // Assuming 'tracks' is an input element
    const array_of_strings = value.split(' '); // Split the string into an array of strings
    const array_of_numbers = array_of_strings.map(Number); // Convert each string to a number
    array_of_numbers.unshift(head.value)
    
    // Generate dynamic labels based on the number of inputs
    const dynamicLabels = array_of_numbers.map((_, index) => `Track ${index + 1}`);
    dynamicLabels.unshift('Disk Head');
    dynamicLabels.pop()
    
    return {array_of_numbers , dynamicLabels}; 
}

const SSTF = (inputList) => {
    // Create a copy of inputList
    let localList = [...inputList];
    // Initialize the sorted list with the head (0th element)
    let sortedList = [localList.shift()];
    let totalSeekCount = 0;

    for (let itemIndex = 0; itemIndex < inputList.length - 1; itemIndex++) {
        // Create a new array of absolute differences between the current head and each track
        let differences = localList.map(x => Math.abs(sortedList[itemIndex] - x));
        // Create a sorted version of the differences array
        let sortedDiffs = [...differences].sort((a, b) => a - b);

        // Identify the index of the smallest difference based on the sorted differences array
        let indexToAppend = differences.indexOf(sortedDiffs[0]);

        // Remove the newest value and add it to the sorted list
        sortedList.push(...localList.splice(indexToAppend, 1));
        totalSeekCount += Math.abs(sortedList[itemIndex] - sortedList[itemIndex + 1]);
    }

    return { sortedList, totalSeekCount };
};

const C_Look = (head, request) => {
    const sortedRequests = [...request].sort((a, b) => a - b);
    const requestOrder = [];
    let tracks = 0;

    const greater = sortedRequests.filter(req => req >= head);
    const less = sortedRequests.filter(req => req < head);

    requestOrder.push(head);

    for (let i = 0; i < greater.length; i++) {
        requestOrder.push(greater[i]);
    }

    for (let i = 0; i < less.length; i++) {
        requestOrder.push(less[i]);
    }

    for (let i = 0; i < requestOrder.length - 1; i++) {
        const count = Math.abs(requestOrder[i + 1] - requestOrder[i]);
        tracks += count;
    }

    return { requestOrder, tracks };
};

const SCAN = (inputList, maxTrack, minTrack) => {
    let localList = [...inputList];
    let SeekCount = 0;
    let ScanOrder = [localList.shift()]; // Appends head (index 0) to the final list

    while (localList.length > 0) {
        // Identifies the head (current track)
        const head = ScanOrder[ScanOrder.length - 1];

        // Creates a sorted list of tracks greater than the head; Set function disables duplicates
        const greaterThan = Array.from(new Set(localList.filter(x => x > head)));

        // Removes all items in local list that are already recorded in the greaterThan list; Ignores duplicates
        greaterThan.forEach(item => {
            const index = localList.indexOf(item);
            if (index !== -1) {
                localList.splice(index, 1);
            }
        });

        // Appends max track if it's not already in the greaterThan (unique to SCAN and C-SCAN)
        if (localList.length > 0 && !greaterThan.includes(maxTrack)) {
            greaterThan.push(maxTrack);
        }

        ScanOrder.push(...greaterThan);
        
        // Creates a sorted list of tracks less than or equal to the head; Set function disables duplicates
        const lessThanOrEqual = Array.from(new Set(localList.filter(x => x <= ScanOrder[ScanOrder.length - 1])));
        
        // Removes all items in local list that are already recorded in the lessThanOrEqual list; Ignores duplicates
        lessThanOrEqual.forEach(item => {
            const index = localList.indexOf(item);
            if (index !== -1) {
                localList.splice(index, 1);
            }
        });

        // Adds the minimum value to the beginning if the lessThanOrEqual list doesn't contain it, also reverses it
        if (localList.length > 0 && !lessThanOrEqual.includes(minTrack)) {
            lessThanOrEqual.unshift(minTrack);
        }
        lessThanOrEqual.reverse(); // Reverses list (unique to non-circular SCAN and LOOK)

        ScanOrder.push(...lessThanOrEqual);
    }

    for (let index = 0; index < ScanOrder.length - 1; index++) {
        SeekCount += Math.abs(ScanOrder[index] - ScanOrder[index + 1]);
    }

    return { ScanOrder, SeekCount };
};

simulate.addEventListener('click', () => {
    let dataValue = convert_array();
    if (algo.value == 'sstf') {
        const { sortedList , totalSeekCount} = SSTF(dataValue.array_of_numbers) 

        myChart.data.datasets[0].data = sortedList;
        myChart.data.labels = dataValue.dynamicLabels
        myChart.options.scales.y.suggestedMax = max_tracks.value
        seektime.innerHTML = totalSeekCount;
        myChart.update()
    }
    else if (algo.value == 'scan') {
        const { ScanOrder, SeekCount } = SCAN(dataValue.array_of_numbers, parseInt(max_tracks.value), 0) 

        myChart.data.datasets[0].data = ScanOrder;
        myChart.data.labels = dataValue.dynamicLabels
        myChart.options.scales.y.suggestedMax = max_tracks.value
        seektime.innerHTML = SeekCount;
        myChart.update()
    }
    else if (algo.value == 'c-look') {
        const { requestOrder, tracks } = C_Look(parseInt(head.value) ,dataValue.array_of_numbers) 

        myChart.data.datasets[0].data = requestOrder;
        myChart.data.labels = dataValue.dynamicLabels
        myChart.options.scales.y.suggestedMax = max_tracks.value
        seektime.innerHTML = tracks;
        myChart.update()
    }
})

// Sample data
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
            // beginAtZero: true,
            min: parseInt(head.value),
            color: 'white'
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
          // beginAtZero: true,
          color: 'white',
        },
        title: {
            display: true,
            text: 'Disk',  // This is the x-axis label
            color: 'white' // Set the color of the x-axis label
          },
        suggestedMax: 200
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