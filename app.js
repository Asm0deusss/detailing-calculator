const brandSelect = document.getElementById("brand");
const modelSelect = document.getElementById("model");
const generationSelect = document.getElementById("generation");
const bodySelect = document.getElementById("body");
const resultBlock = document.getElementById("result");
const message = document.getElementById("message");
const priceTableBody = document.getElementById("price-table-body");

let cars = [];

const setOptions = (select, values, placeholder) => {
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
};

const unique = (arr) => [...new Set(arr)];

const getFilteredCars = () =>
  cars.filter((car) => {
    if (brandSelect.value && car.brand !== brandSelect.value) return false;
    if (modelSelect.value && car.model !== modelSelect.value) return false;
    if (generationSelect.value && car.generation !== generationSelect.value) return false;
    if (bodySelect.value && car.body !== bodySelect.value) return false;
    return true;
  });

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

const updateSelectors = () => {
  const byBrand = getFilteredCars();

  if (!brandSelect.value) {
    setOptions(modelSelect, [], "Сначала выберите марку");
    setOptions(generationSelect, [], "Сначала выберите модель");
    setOptions(bodySelect, [], "Сначала выберите поколение");
    message.textContent = "";
    resetResult();
    return;
  }

  const models = unique(byBrand.map((car) => car.model));
  setOptions(modelSelect, models, "Выберите модель");

  const byBrandModel = byBrand.filter((car) => car.model === modelSelect.value);
  const generations = unique(byBrandModel.map((car) => car.generation));
  setOptions(generationSelect, generations, "Выберите поколение");

  const byBrandModelGeneration = byBrandModel.filter(
    (car) => car.generation === generationSelect.value
  );
  const bodies = unique(byBrandModelGeneration.map((car) => car.body));
  setOptions(bodySelect, bodies, "Выберите кузов");

  const selected = cars.find(
    (car) =>
      car.brand === brandSelect.value &&
      car.model === modelSelect.value &&
      car.generation === generationSelect.value &&
      car.body === bodySelect.value
  );

  if (selected) {
    message.textContent = "";
    renderPrices(selected);
  } else {
    resetResult();
    if (bodySelect.value) {
      message.textContent = "Для выбранной конфигурации цены не найдены.";
    }
  }
};

const preserveOrReset = (select, validValues) => {
  if (!validValues.includes(select.value)) {
    select.value = "";
  }
};

const onBrandChange = () => {
  const models = unique(cars.filter((c) => c.brand === brandSelect.value).map((c) => c.model));
  preserveOrReset(modelSelect, models);
  generationSelect.value = "";
  bodySelect.value = "";
  updateSelectors();
};

const onModelChange = () => {
  const generations = unique(
    cars
      .filter((c) => c.brand === brandSelect.value && c.model === modelSelect.value)
      .map((c) => c.generation)
  );
  preserveOrReset(generationSelect, generations);
  bodySelect.value = "";
  updateSelectors();
};

const onGenerationChange = () => {
  const bodies = unique(
    cars
      .filter(
        (c) =>
          c.brand === brandSelect.value &&
          c.model === modelSelect.value &&
          c.generation === generationSelect.value
      )
      .map((c) => c.body)
  );
  preserveOrReset(bodySelect, bodies);
  updateSelectors();
};

brandSelect.addEventListener("change", onBrandChange);
modelSelect.addEventListener("change", onModelChange);
generationSelect.addEventListener("change", onGenerationChange);
bodySelect.addEventListener("change", updateSelectors);

const init = async () => {
  try {
    const response = await fetch("data.json");
    cars = await response.json();

    const brands = unique(cars.map((car) => car.brand));
    setOptions(brandSelect, brands, "Выберите марку");
    setOptions(modelSelect, [], "Сначала выберите марку");
    setOptions(generationSelect, [], "Сначала выберите модель");
    setOptions(bodySelect, [], "Сначала выберите поколение");
  } catch (error) {
    message.textContent = "Не удалось загрузить данные. Проверьте data.json.";
    console.error(error);
  }
};

init();
