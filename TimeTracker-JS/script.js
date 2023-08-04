const apikey = '1f4da9a8-0567-4e2f-acfb-e27f13fb28e8';
const apihost = 'https://todo-api.coderslab.pl';

if (!apikey) {
    alert('Invalid key');
}

async function fetchData(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        alert('Error occurred');
    }
    return response.json();
}

function createHeaders(contentType = 'application/json') {
    return {
        'Authorization': apikey,
        'Content-Type': contentType,
    };
}

async function apiListAllTasks() {
    return fetchData(`${apihost}/api/tasks`, { headers: createHeaders() });
}

async function apiCreateTask(title, description) {
    const options = {
        headers: createHeaders(),
        body: JSON.stringify({ title, description, status: 'open' }),
        method: 'POST',
    };
    return fetchData(`${apihost}/api/tasks`, options);
}

async function apiUpdateTask(taskId, title, description, status) {
    const options = {
        headers: createHeaders(),
        body: JSON.stringify({ title, description, status }),
        method: 'PUT',
    };
    return fetchData(`${apihost}/api/tasks/${taskId}`, options);
}

async function apiDeleteTask(taskId) {
    const options = {
        headers: createHeaders(),
        method: 'DELETE',
    };
    return fetchData(`${apihost}/api/tasks/${taskId}`, options);
}

async function apiListOperationsForTask(taskId) {
    return fetchData(`${apihost}/api/tasks/${taskId}/operations`, { headers: createHeaders() });
}

async function apiCreateOperationForTask(taskId, description) {
    const options = {
        headers: createHeaders(),
        body: JSON.stringify({ description, timeSpent: 0 }),
        method: 'POST',
    };
    return fetchData(`${apihost}/api/tasks/${taskId}/operations`, options);
}

async function apiUpdateOperation(operationId, description, timeSpent) {
    const options = {
        headers: createHeaders(),
        body: JSON.stringify({ description, timeSpent }),
        method: 'PUT',
    };
    return fetchData(`${apihost}/api/operations/${operationId}`, options);
}

async function apiDeleteOperation(operationId) {
    const options = {
        headers: createHeaders(),
        method: 'DELETE',
    };
    return fetchData(`${apihost}/api/operations/${operationId}`, options);
}

function renderTaskControlButtons(taskId, title, description, status) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'js-task-open-only';

    if (status === 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm';
        finishButton.innerText = 'Finish';
        finishButton.addEventListener('click', async () => {
            await apiUpdateTask(taskId, title, description, 'closed');
            controlDiv.remove();
        });
        controlDiv.appendChild(finishButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', async () => {
        await apiDeleteTask(taskId);
        controlDiv.parentElement.remove();
    });
    controlDiv.appendChild(deleteButton);

    return controlDiv;
}

async function renderOperationControlButtons(status, operationId, operationDescription, timeSpan, timeElement) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'js-task-open-only';

    if (status === 'open') {
        const addButton = (label, time) => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-success btn-sm mr-2';
            button.innerText = label;
            button.addEventListener('click', async () => {
                const response = await apiUpdateOperation(operationId, operationDescription, timeSpan + time);
                timeSpan = response.data.timeSpent;
                timeElement.innerText = formatTime(timeSpan);
            });
            controlDiv.appendChild(button);
        };

        addButton('+15m', 15);
        addButton('+1h', 60);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm';
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', async () => {
            await apiDeleteOperation(operationId);
            controlDiv.parentElement.remove();
        });
        controlDiv.appendChild(deleteButton);
    }

    return controlDiv;
}

function renderTask(taskId, title, description, status) {
    const section = document.createElement('section');
    section.className = 'card mt-5 shadow-sm';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';

    const headerLeftDiv = document.createElement('div');

    const h5 = document.createElement('h5');
    h5.innerText = title;

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;

    const headerRightDiv = document.createElement('div');

    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';

    const addOperationDiv = document.createElement('div');
    addOperationDiv.className = 'card-body js-task-open-only';

    if (status === 'open') {
        headerLeftDiv.appendChild(h5);
        headerLeftDiv.appendChild(h6);
        headerDiv.appendChild(headerLeftDiv);

        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm';
        finishButton.innerText = 'Finish';
        finishButton.addEventListener('click', async () => {
            await apiUpdateTask(taskId, title, description, 'closed');
            section.querySelector('.js-task-open-only').remove();
        });
        headerRightDiv.appendChild(finishButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', async () => {
            await apiDeleteTask(taskId);
            section.remove();
        });
        headerRightDiv.appendChild(deleteButton);

        const form = document.createElement('form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const input = event.target.querySelector('input');
            const response = await apiCreateOperationForTask(taskId, input.value);
            renderOperation(ul, status, response.data.id, response.data.description, response.data.timeSpent);
            input.value = '';
        });

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        form.appendChild(inputGroup);

        const descriptionInput = document.createElement('input');
        descriptionInput.setAttribute('type', 'text');
        descriptionInput.setAttribute('placeholder', 'Operation description');
        descriptionInput.setAttribute('minlength', '5');
        descriptionInput.className = 'form-control';
        inputGroup.appendChild(descriptionInput);

        const inputGroupAppend = document.createElement('div');
        inputGroupAppend.className = 'input-group-append';
        inputGroup.appendChild(inputGroupAppend);

        const addButton = document.createElement('button');
        addButton.className = 'btn btn-info';
        addButton.innerText = 'Add';
        inputGroupAppend.appendChild(addButton);

        addOperationDiv.appendChild(form);
    }

    headerDiv.appendChild(headerRightDiv);
    section.appendChild(headerDiv);
    section.appendChild(ul);
    section.appendChild(addOperationDiv);

    document.querySelector('main').appendChild(section);

    apiListOperationsForTask(taskId).then((response) => {
        response.data.forEach((operation) => {
            renderOperation(ul, status, operation.id, operation.description, operation.timeSpent);
        });
    });
}

function renderOperation(ul, status, operationId, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    ul.appendChild(li);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    li.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = formatTime(timeSpent);
    descriptionDiv.appendChild(time);

    if (status === 'open') {
        renderOperationControlButtons(status, operationId, operationDescription, timeSpent, time)
            .then((controlDiv) => {
                li.appendChild(controlDiv);
            });
    }
}

function formatTime(total) {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const response = await apiListAllTasks();
    response.data.forEach((task) => {
        renderTask(task.id, task.title, task.description, task.status);
    });

    document.querySelector('.js-task-adding-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const { title, description } = event.target.elements;
        const response = await apiCreateTask(title.value, description.value);
        renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
    });
});