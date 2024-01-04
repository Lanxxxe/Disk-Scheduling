//Checked
const sstfDiskScheduling = (requests, initialHeadPosition) => {
    // Copy the array of requests to avoid modifying the original array
    let remainingRequests = [...requests];
    // Initialize the total seek count and head movement list
    let totalSeekCount = 0;
    let headMovement = [];
    // Set the current head position
    let currentHeadPosition = initialHeadPosition;
    while (remainingRequests.length > 0) {
        // Find the request with the shortest seek time
        let nearestRequest = remainingRequests.reduce((nearest, request) =>
            Math.abs(request - currentHeadPosition) < Math.abs(nearest - currentHeadPosition) ? request : nearest
        );
        // Calculate the seek time for the selected request
        let seekDistance = Math.abs(nearestRequest - currentHeadPosition);
        // Update the total seek count
        totalSeekCount += seekDistance;
        // Record the head movement
        headMovement.push(currentHeadPosition);
        // Move the head to the selected request
        currentHeadPosition = nearestRequest;
        // Remove the processed request from the array
        remainingRequests = remainingRequests.filter(request => request !== nearestRequest);
    }
    // Record the final head position
    headMovement.push(currentHeadPosition);
    return { totalSeekCount, headMovement };
}

//Checked
const C_Look = (head, request) => {
    //Sort the current disk request
    let sortedRequests = [...request].sort((a, b) => a - b);
    //Initialization of the total seek time and head movements
    let requestOrder = [];
    let tracks = 0;

    // Separate the disk requests base on the conditions
    let greater = sortedRequests.filter(req => req >= head);
    let less = sortedRequests.filter(req => req < head);

    // Add the requests in the correct order of the disk heads
    requestOrder.push(head);
    requestOrder.push(...greater);
    requestOrder.push(...less);

    //Calculate the total seek time
    for (let req = 0; req < requestOrder.length - 1; req++) { 
        let count = Math.abs(requestOrder[req + 1] - requestOrder[req]);
        tracks += count;
    }

    return { requestOrder, tracks };
}

//Checked
const SCAN = (inputlist, mx, mn) => {
    // Local array to enable popping without modifying the global array
    let localList = [...inputlist];
    let totalSeekCount = 0;
    let sortedList = [localList.shift()]; // Appends head (index 0) to the final array

    while (localList.length > 0) {
        // Identifies the head (current track)
        let head = sortedList[sortedList.length - 1];

        // Creates a sorted array of tracks greater than the head; Set function disables duplicates
        
        let greaterThan = localList.filter(x => x > head).sort((a, b) => a - b);

        // Removes all items in local array that are already recorded in the greaterThan array; Ignores duplicates
        greaterThan.forEach(item => {
            if (localList.includes(item)) {
                localList.splice(localList.indexOf(item), 1);
            }
        });

        // Appends max track if max is not already in the greaterThan array (unique to SCAN and C-SCAN)
        if (localList.length > 0 && !greaterThan.includes(mx)) {
            greaterThan.push(mx);
        }

        sortedList.push(...greaterThan);
        head = sortedList[sortedList.length - 1];

        // Creates a sorted array of tracks lesser than or equal to the head; Set function disables duplicates
        let lesserThan = localList.filter(x => x <= head).sort((a, b) => b - a);

        // Removes all items in local array that are already recorded in the lesserThan array; Ignores duplicates
        lesserThan.forEach(item => {
            if (localList.includes(item)) {
                localList.splice(localList.indexOf(item), 1);
            }
        });

        // Adds the minimum value to the beginning if the lesserThan array doesn't contain it, also reverses it
        if (localList.length > 0 && !lesserThan.includes(mn)) {
            lesserThan.unshift(mn);
        }

        sortedList.push(...lesserThan);
    }
    
    //Calculation of the total seek time
    for (let index = 0; index < sortedList.length - 1; index++) {
        totalSeekCount += Math.abs(sortedList[index] - sortedList[index + 1]);
    }

    return { sortedList, totalSeekCount };
}