'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1: document.querySelector('.h1'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar')
	},
	content: {
		daysContainer: document.getElementById('days'),
		nextDay: document.querySelector('.habbit__day')
	},
	popup: {
		index: document.querySelector('#add-habbit-popup'),
		iconField: document.querySelector('.popup__form input[name="icon"]')
	}
}

/* utils */
function loadData() {
	// 1. Получаем строку данных из локального хранилища по ключу HABBIT_KEY.
	const habbitsString = localStorage.getItem(HABBIT_KEY);
	// 2. Пытаемся преобразовать полученную строку в массив объектов с помощью JSON.parse.
	const habbitArray = JSON.parse(habbitsString);
	// 3. Проверяем, является ли результат парсинга массивом (Array.isArray).
	if (Array.isArray(habbitArray)) {
		// 4. Если результат - массив, присваиваем его переменной habbits.
		habbits = habbitArray;
	}
}

function saveData() {
	// Сериализуем массив объектов habbits в строку JSON и сохраняем ее в локальное хранилище.
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = '';
	}
}

function validateAndGetFormData(form, fields) {
	const formData = new FormData(form);
	const res = {};

	for (const field of fields) {
		const fieldValue = formData.get(field);
		form[field].classList.remove('error');
		if (!fieldValue) {
			form[field].classList.add('error');
		}
		res[field] = fieldValue;
	}
	let isValid = true;
	for (const field of fields) {
		if (!res[field]) {
			isValid = false;
		}
	}
	if (!isValid) {
		return;
	}
	return res;
}

/* render */
function rerenderMenu(activeHabbit) {
	// Перебор массива объектов habbits
	for (const habbit of habbits) {
		// Поиск элемента меню с атрибутом menu-habbit-id равным id текущей привычки.
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);

		// Если элемент не существует, создаем новый
		if (!existed) {
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img src="./lib/img/${habbit.icon}.svg" alt="${habbit.name}" />`

			// Помечаем элемент как активный, если он соответствует активной привычке
			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu__item_active');
			}

			// Добавляем созданный элемент в DOM (в родительский элемент с классом 'menu')
			page.menu.appendChild(element);

			// Продолжаем с следующей итерации цикла
			continue;
		}

		// Если элемент уже существует, обновляем его состояние (активный/неактивный)
		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu__item_active');
		} else {
			existed.classList.remove('menu__item_active');
		}
	}
}

function rerenderHead(activeHabbit) {
	page.header.h1.innerHTML = activeHabbit.name;
	const progress = activeHabbit.days.length / activeHabbit.target > 1
		? 100
		: activeHabbit.days.length / activeHabbit.target * 100
	page.header.progressPercent.innerHTML = progress.toFixed(0) + '%';
	page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
	page.content.daysContainer.innerHTML = '';

	for (const index in activeHabbit.days) {

		const element = document.createElement('div');
		element.classList.add('habbit');
		element.setAttribute('day-habbit-id', index);
		element.addEventListener('click', () => rerender(activeHabbit.id));

		// Добавляем текстовое содержимое
		const dayElement = document.createElement('div');
		dayElement.classList.add('habbit__day');
		dayElement.innerHTML = (`День ${Number(index) + 1}`);
		element.appendChild(dayElement);

		// Создаем элемент для комментария
		const commentElement = document.createElement("div");
		commentElement.classList.add("habbit__comment");
		commentElement.innerHTML = activeHabbit.days[index].comment

		// Добавляем обертку дня, комментарий и кнопку удаления в общий контейнер
		const tagDays = document.querySelector('#days').appendChild(element);
		tagDays.appendChild(commentElement);
		tagDays.innerHTML += `<button class="habbit__delete" onclick="deleteDays(${index})"><img src="/lib/img/delete.svg" alt=""></button>`;
	}
	page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`
}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;

	// Находим активную привычку по её идентификатору в массиве habbits
	const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
	// Проверка, существует ли активная привычка
	if (!activeHabbit) {
		return;
	}

	document.location.replace(document.location.pathname + '#' + activeHabbitId);
	// Вызываем функцию rerenderMenu с найденной активной привычкой в качестве аргумента
	rerenderMenu(activeHabbit);
	rerenderHead(activeHabbit);
	rerenderContent(activeHabbit);
}

/* work with days */
function addDays(event) {
	event.preventDefault();

	const data = validateAndGetFormData(event.target, ['comment']);
	if (!data) {
		return;
	}


	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment: data.comment }])
			}
		}
		return habbit;
	});
	resetForm(event.target, ['comment']);
	rerender(globalActiveHabbitId);
	saveData();
}

function deleteDays(index) {
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days
			};
		}
		return habbit;
	});
	rerender(globalActiveHabbitId);
	saveData();
}

/* popup */
function togglePopup() {
	if (page.popup.index.classList.contains('cover_hidden')) {
		page.popup.index.classList.remove('cover_hidden');
	} else {
		page.popup.index.classList.add('cover_hidden');
	}
}

function setIcon(context, icon) {
	page.popup.iconField.value = icon;
	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');
	context.classList.add('icon_active');
}

/* work with habbits */
function addHabbit(event) {
	event.preventDefault();

	const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
	if (!data) {
		return;
	}
	const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
	habbits.push({
		id: maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: []
	});
	resetForm(event.target, ['name', 'target']);
	togglePopup();
	saveData();
	rerender(maxId + 1);
}

/* init */
(() => {
	loadData();
	const hashId = Number(document.location.hash.replace('#', ''));
	const urlHabbit = habbits.find(habbit => habbit.id == hashId);
	if (urlHabbit) {
		rerender(urlHabbit.id);
	} else {
		rerender(habbits[0].id);
	}
})();