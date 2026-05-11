const brandSelect = document.getElementById("brand");
const modelSelect = document.getElementById("model");
const generationSelect = document.getElementById("generation");
const bodySelect = document.getElementById("body");
const resultBlock = document.getElementById("result");
const message = document.getElementById("message");
const priceTableBody = document.getElementById("price-table-body");

let cars = [];

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
    option.textContent = value;
    select.appendChild(option);
  });

  select.disabled = values.length === 0;
  if (selectedValue && values.includes(selectedValue)) {
    select.value = selectedValue;
  } else {
    select.value = "";
  }
};

const resetResult = () => {
  resultBlock.classList.add("hidden");
  priceTableBody.innerHTML = "";
};

const renderPrices = (car) => {
  priceTableBody.innerHTML = "";

  Object.entries(car.prices).forEach(([type, price]) => {
    const row = document.createElement("tr");
    const typeCell = document.createElement("td");
    const priceCell = document.createElement("td");

    typeCell.textContent = type;
    priceCell.textContent = new Intl.NumberFormat("ru-RU").format(price);

    row.append(typeCell, priceCell);
    priceTableBody.appendChild(row);
  });

  resultBlock.classList.remove("hidden");
};

const refreshForm = () => {
  const selectedBrand = brandSelect.value;
  const selectedModel = modelSelect.value;
  const selectedGeneration = generationSelect.value;
  const selectedBody = bodySelect.value;

  const brands = unique(cars.map((car) => car.brand));
  setOptions(brandSelect, brands, "Выберите марку", selectedBrand);

  if (!brandSelect.value) {
    setOptions(modelSelect, [], "Сначала выберите марку");
    setOptions(generationSelect, [], "Сначала выберите модель");
    setOptions(bodySelect, [], "Сначала выберите поколение");
    message.textContent = "";
    resetResult();
    return;
  }

  const brandCars = cars.filter((car) => car.brand === brandSelect.value);
  const models = unique(brandCars.map((car) => car.model));
  setOptions(modelSelect, models, "Выберите модель", selectedModel);

  if (!modelSelect.value) {
    setOptions(generationSelect, [], "Сначала выберите модель");
    setOptions(bodySelect, [], "Сначала выберите поколение");
    message.textContent = "";
    resetResult();
    return;
  }

  const modelCars = brandCars.filter((car) => car.model === modelSelect.value);
  const generations = unique(modelCars.map((car) => car.generation));
  setOptions(generationSelect, generations, "Выберите поколение", selectedGeneration);

  if (!generationSelect.value) {
    setOptions(bodySelect, [], "Сначала выберите поколение");
    message.textContent = "";
    resetResult();
    return;
  }

  const generationCars = modelCars.filter(
    (car) => car.generation === generationSelect.value
  );
  const bodies = unique(generationCars.map((car) => car.body));
  setOptions(bodySelect, bodies, "Выберите кузов", selectedBody);

  if (!bodySelect.value) {
    message.textContent = "";
    resetResult();
    return;
  }

  const selected = generationCars.find((car) => car.body === bodySelect.value);

  if (selected) {
    message.textContent = "";
    renderPrices(selected);
  } else {
    message.textContent = "Для выбранной конфигурации цены не найдены.";
    resetResult();
  }
};

brandSelect.addEventListener("change", refreshForm);
modelSelect.addEventListener("change", refreshForm);
generationSelect.addEventListener("change", refreshForm);
bodySelect.addEventListener("change", refreshForm);

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
