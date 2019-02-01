/*
**dev branch
**START BUDGET CONTROLLER
******************************************************************
*/
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    //return==========================================>
    return {
        addItem: function(type, des, val) 
        {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;
            // get only ids from exp or inc objects array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }  
            
        },
        getBudget: function() {
            return{
                budget    : data.budget,
                totalInc  : data.totals.inc,
                totalExp  : data.totals.exp,
                percentage: data.percentage
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getData: function () {
            return data;
        }
    } 
    
})();

/*
**END BUDGET CONTROLLER
******************************************************************
*/

/*
**START UI CONTROLLER
******************************************************************
*/
var UIController = (function () {
    // dom selctors classess , ides etc ,,,
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    //desply number in money format like 10,000.00
    formatNumber = function(num,type,c, d, t){
        var n = num,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;
        var final = s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        return  (type === 'exp' ? '-' : '+') + ' ' + final;
    };
    //retreive all html elemens => void
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    //return
    return {
        // get input values that you wrote 
        getInput: function () 
        {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        // add row item to UI
        addListItem: function(obj, type)
         {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') 
            {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>';
            } else if (type === 'exp') 
            {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        // clear fields after add method ...
        clearFields: function () 
        {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            nodeListForEach(fields,function (current) {
                current.value = "";
            });
            // add curser at description field
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent   = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent   = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });         
        },
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        // to return dom strings object
        getDOMstrings : function () { return DOMstrings; }
    }

})();

/*
**END UI CONTROLLER
******************************************************************
*/

/*
**START GLOBAL APP CONTROLLER
******************************************************************
*/
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() 
    {
        var DOM = UICtrl.getDOMstrings();
        // execute ctrlAddItem function when you click add button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // execute ctrlAddItem function when you press Enter
        document.addEventListener('keypress', function(event) {
            // check if you press enter
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        }); 
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);  
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);    
    };

    function updateBudget() {
        //1. Calculate budget
        budgetCtrl.calculateBudget();
        //2. Return budget
        var budget = budgetCtrl.getBudget();
        //3. display budget on UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();        
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            // 6. Calculate and update percentages
            updatePercentages();
        }
        console.log(budgetCtrl.getData());
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type,ID)
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }
        console.log(budgetCtrl.getData());
    };

    return {
        init: function ()
        {
            UICtrl.displayMonth();
            UICtrl.displayBudget(
                {
                    budget    : 0,
                    totalInc  : 0,
                    totalExp  : 0,
                    percentage:-1
                }
            );
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();