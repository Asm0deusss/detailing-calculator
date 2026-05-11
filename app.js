const brandSelect = document.getElementById("brand");
const modelSelect = document.getElementById("model");
const bodySelect = document.getElementById("body");
const generationSelect = document.getElementById("generation");
const elementSelect = document.getElementById("element");
const filmSelect = document.getElementById("film");
const resultBlock = document.getElementById("result");
const message = document.getElementById("message");
const priceTableBody = document.getElementById("price-table-body");
const copyAnswerButton = document.getElementById("copy-answer");

const ALL_FILMS = "__all__";
const FILM_OPTIONS = [
  "Корейская пленка SunGear",
  "Американская пленка UltraVision",
  "Премиальная корейская пленка ShadowGuard"
];

const ELEMENT_OPTIONS = [
  "Тонировка в круг",
  "Тонировка лобового стекла",
  "Тонировка переднего левого стекла",
  "Тонировка переднего правого стекла",
  "Тонировка заднего левого стекла",
  "Тонировка заднего правого стекла",
  "Тонировка задней левой фоточки",
  "Тонировка задней правой фоточки",
  "Тонировка заднего стекла",
  "Тонировка двух боковых стекл",
  "Тонировка передней полусферы",
  "Тонировка задней полусферы"
];

let cars = [];
let currentRows = [];

const unique = (arr) => [...new Set(arr)];

const setOptions = (select, values, placeholder, selectedValue = "") => {
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = placeholder;
  select.appendChild(defaultOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === ALL_FILMS ? "Все варианты" : value;
    select.appendChild(option);
  });

  select.disabled = values.length === 0;
  select.value = values.includes(selectedValue) ? selectedValue : "";
};

const resetResult = () => {
  resultBlock.classList.add("hidden");
  priceTableBody.innerHTML = "";
  currentRows = [];
};

const renderPriceRows = (rows) => {
  currentRows = rows;
  priceTableBody.innerHTML = "";

  rows.forEach(({ film, price }) => {
    const row = document.createElement("tr");
    const filmCell = document.createElement("td");
    const priceCell = document.createElement("td");

    filmCell.textContent = film;
    priceCell.textContent = new Intl.NumberFormat("ru-RU").format(price);

    row.append(filmCell, priceCell);
    priceTableBody.appendChild(row);
  });

  resultBlock.classList.remove("hidden");
};

const buildCopyText = () => {
  const lines = ["Стоимость тонировки вашего автомобиля:", ""];
  currentRows.forEach(({ film, price }) => {
    const formattedPrice = new Intl.NumberFormat("ru-RU").format(price);
    lines.push(`${film}: ${formattedPrice} ₽`);
  });
  return lines.join("\n");
};

const copyAnswer = async () => {
  if (currentRows.length === 0) {
    message.textContent = "Сначала выберите параметры, чтобы получить стоимость.";
    return;
  }

  try {
    await navigator.clipboard.writeText(buildCopyText());
    message.textContent = "Ответ скопирован в буфер обмена.";
  } catch (error) {
    message.textContent = "Не удалось скопировать ответ. Попробуйте еще раз.";
    console.error(error);
  }
};

const refreshForm = () => {
  const selectedBrand = brandSelect.value;
  const selectedModel = modelSelect.value;
  const selectedBody = bodySelect.value;
  const selectedGeneration = generationSelect.value;
  const selectedElement = elementSelect.value;
  const selectedFilm = filmSelect.value;

  const brands = unique(cars.map((car) => car.brand));
  setOptions(brandSelect, brands, "Выберите марку", selectedBrand);

  if (!brandSelect.value) {
    setOptions(modelSelect, [], "Сначала выберите марку");
    setOptions(bodySelect, [], "Сначала выберите модель");
    setOptions(generationSelect, [], "Сначала выберите кузов");
    setOptions(elementSelect, [], "Сначала выберите поколение");
    setOptions(filmSelect, [], "Сначала выберите элемент");
    message.textContent = "";
    resetResult();
    return;
  }

  const brandCars = cars.filter((car) => car.brand === brandSelect.value);
  const models = unique(brandCars.map((car) => car.model));
  setOptions(modelSelect, models, "Выберите модель", selectedModel);

  if (!modelSelect.value) {
    setOptions(bodySelect, [], "Сначала выберите модель");
    setOptions(generationSelect, [], "Сначала выберите кузов");
    setOptions(elementSelect, [], "Сначала выберите поколение");
    setOptions(filmSelect, [], "Сначала выберите элемент");
    message.textContent = "";
    resetResult();
    return;
  }

  const modelCars = brandCars.filter((car) => car.model === modelSelect.value);
  const bodies = unique(modelCars.map((car) => car.body));
  setOptions(bodySelect, bodies, "Выберите тип кузова", selectedBody);

  if (!bodySelect.value) {
    setOptions(generationSelect, [], "Сначала выберите кузов");
    setOptions(elementSelect, [], "Сначала выберите поколение");
    setOptions(filmSelect, [], "Сначала выберите элемент");
    message.textContent = "";
    resetResult();
    return;
  }

  const bodyCars = modelCars.filter((car) => car.body === bodySelect.value);
  const generations = unique(bodyCars.map((car) => car.generation));
  setOptions(generationSelect, generations, "Выберите поколение", selectedGeneration);

  if (!generationSelect.value) {
    setOptions(elementSelect, [], "Сначала выберите поколение");
    setOptions(filmSelect, [], "Сначала выберите элемент");
    message.textContent = "";
    resetResult();
    return;
  }

  const selectedCar = bodyCars.find((car) => car.generation === generationSelect.value);
  if (!selectedCar) {
    setOptions(elementSelect, [], "Сначала выберите поколение");
    setOptions(filmSelect, [], "Сначала выберите элемент");
    message.textContent = "Конфигурация авто не найдена.";
    resetResult();
    return;
  }

  const elements = ELEMENT_OPTIONS.filter((element) => element in selectedCar.elements);
  setOptions(elementSelect, elements, "Выберите элемент", selectedElement);

  if (!elementSelect.value) {
    setOptions(filmSelect, [], "Сначала выберите элемент");
    message.textContent = "";
    resetResult();
    return;
  }

  setOptions(filmSelect, [ALL_FILMS, ...FILM_OPTIONS], "Выберите пленку", selectedFilm);

  if (!filmSelect.value) {
    message.textContent = "";
    resetResult();
    return;
  }

  const elementPrices = selectedCar.elements[elementSelect.value];
  if (!elementPrices) {
    message.textContent = "Цены для выбранного элемента не найдены.";
    resetResult();
    return;
  }

  if (filmSelect.value === ALL_FILMS) {
    const rows = FILM_OPTIONS.filter((film) => typeof elementPrices[film] === "number").map((film) => ({
      film,
      price: elementPrices[film]
    }));

    if (rows.length === 0) {
      message.textContent = "Цены для выбранного элемента не найдены.";
      resetResult();
      return;
    }

    message.textContent = "";
    renderPriceRows(rows);
    return;
  }

  const price = elementPrices[filmSelect.value];
  if (typeof price !== "number") {
    message.textContent = "Цена для выбранной пленки не найдена.";
    resetResult();
    return;
  }

  message.textContent = "";
  renderPriceRows([{ film: filmSelect.value, price }]);
};

brandSelect.addEventListener("change", refreshForm);
modelSelect.addEventListener("change", refreshForm);
bodySelect.addEventListener("change", refreshForm);
generationSelect.addEventListener("change", refreshForm);
elementSelect.addEventListener("change", refreshForm);
filmSelect.addEventListener("change", refreshForm);
copyAnswerButton.addEventListener("click", copyAnswer);

const init = async () => {
  try {
    const response = await fetch("data.json");
    cars = await response.json();
    refreshForm();
  } catch (error) {
    message.textContent = "Не удалось загрузить данные. Проверьте data.json.";
    console.error(error);
  }
};

init();
