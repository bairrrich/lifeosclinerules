// ============================================
// Финансовые категории с ключами переводов
// ============================================

export const financeCategoriesStructure: Record<
  string,
  Record<string, { subcategories: Record<string, string[]> }>
> = {
  income: {
    salary: { subcategories: { main: [], bonus: [], allowance: [] } },
    freelance: { subcategories: { development: [], design: [], consulting: [] } },
    investments: { subcategories: { dividends: [], interest: [], coupons: [] } },
    other: { subcategories: { gifts: [], refund: [], other: [] } },
  },
  expense: {
    product: {
      subcategories: {
        dairy: ["milk", "cheese", "cottageCheese", "sourCream", "kefir", "yogurt", "butter"],
        meat: ["beef", "pork", "lamb", "chicken", "turkey", "duck"],
        fish: ["trout", "herring", "salmon", "cod", "carp", "pikeperch", "mackerel"],
        vegetables: [
          "potato",
          "carrot",
          "onion",
          "beet",
          "cucumber",
          "tomato",
          "cabbage",
          "pepper",
        ],
        fruits: ["apples", "bananas", "oranges", "tangerines", "pears", "grape", "kiwi"],
        berries: ["strawberry", "raspberry", "blueberry", "currant", "cherry", "cranberry"],
        cereals: ["rice", "buckwheat", "oatmeal", "semolina", "millet", "barley"],
        bread: ["whiteBread", "blackBread", "baton", "buns", "lavash"],
        drinks: ["tea", "coffee", "juices", "water", "soda", "kvass"],
        groceries: ["pasta", "sugar", "salt", "flour", "vegetableOil", "vinegar"],
        confectionery: ["chocolate", "candy", "cookies", "cakes", "honey", "jam"],
        frozen: ["dumplings", "vareniki", "vegetableMix", "frozenBerries", "iceCream"],
      },
    },
    transport: {
      subcategories: {
        taxi: ["yandexTaxi", "uber", "sitimobil"],
        public: ["metro", "bus", "tram"],
        fuel: ["lukoil", "gazprom", "rosneft"],
      },
    },
    entertainment: {
      subcategories: {
        cinema: [],
        concerts: [],
        cafe: [],
        subscriptions: ["netflix", "yandexPlus", "youtubePremium"],
      },
    },
    health: {
      subcategories: { pharmacy: ["aptekaRu", "rigla", "zivika", "gordrav"], doctor: [], gym: [] },
    },
    clothing: { subcategories: { shoes: [], outerwear: [], casual: [] } },
    housing: { subcategories: { rent: [], utilities: [], repair: [] } },
    communication: {
      subcategories: {
        mobile: ["mts", "beeline", "megafon", "tele2"],
        internet: ["rostelecom", "domRu"],
        tv: [],
      },
    },
    education: { subcategories: { courses: [], books: [], tutor: [] } },
    other: { subcategories: { gifts: [], other: [] } },
  },
  transfer: {
    transfer: {
      subcategories: {
        toCard: ["sberbank", "tinkoff", "alfa"],
        toAccount: [],
        toCash: [],
      },
    },
    topUp: {
      subcategories: {
        fromCard: ["sberbank", "tinkoff", "alfa"],
        inCash: [],
      },
    },
  },
}

// ============================================
// Поставщики по категориям
// ============================================

export const financeSuppliers: Record<string, string[]> = {
  product: ["magnit", "pyaterochka", "azbukaVkusa", "perekrestok", "yandexEda", "samokat"],
  transport: ["yandexTaxi", "uber", "sitimobil", "lukoil", "gazprom"],
  entertainment: ["netflix", "yandexPlus", "youtubePremium", "cinemaHall"],
  health: ["aptekaRu", "rigla", "zivika", "gordrav"],
  communication: ["mts", "beeline", "megafon", "tele2", "rostelecom"],
  default: [],
}
