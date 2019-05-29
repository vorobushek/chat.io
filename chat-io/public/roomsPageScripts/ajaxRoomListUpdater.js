setInterval(() => {


    fetch('/ajaxData')
        .then(function(response) {
           
            return response.json();
        })
        .then(function(data) {
            console.log(data); 
            console.log(data.rooms); 


            var tbody = document.querySelector('tbody')
            tbody.innerHTML = "";

            (data.rooms).forEach((e) => {

                var tr = document.createElement('tr');
                var tdRoomName = document.createElement('td');
                var tdUserNum = document.createElement('td');
                var tdMove = document.createElement('td');
                var buttonMove = document.createElement('button')
                var buttonIcon = document.createElement('i')


                buttonMove.setAttribute("type", "button");
                buttonMove.setAttribute("class", "btn btn-mini col-5");
                buttonMove.setAttribute("data-toggle", "modal");
                buttonMove.setAttribute("data-target", "#exampleModalForTest");

                buttonIcon.className = "fas fa-paper-plane"

                tdMove.setAttribute("align", "center")


                buttonMove.appendChild(buttonIcon)
                tdMove.appendChild(buttonMove)
                tdUserNum.textContent = e.userNum;
                tdRoomName.textContent = e.name;

                tr.appendChild(tdRoomName);
                tr.appendChild(tdUserNum);
                tr.appendChild(tdMove);

                tbody.appendChild(tr)




                //взятие имени из таблицы

                var cells = document.querySelectorAll('#tbody td');

                function logText() {
                    console.log(this.textContent);
                    console.log(cells);



                    //т.к. индексация идет с 0 , то мы береме остаток ==2 (5%3=2, 8%3=2 ...)
                    if (this.cellIndex % 3 == 2) {

                        console.log(cells[this.cellIndex - 2].textContent)
                        var postConnect = document.querySelector('#connectRoomName')
                        console.log(this.cellIndex + 1);
                        console.log(this.parentElement.rowIndex);
                        console.log((this.cellIndex + 1) * (this.parentElement.rowIndex) - 3)
                        console.log(cells[(this.cellIndex + 1) * (this.parentElement.rowIndex) - 3].textContent)




                        postConnect.value = cells[(this.cellIndex + 1) * (this.parentElement.rowIndex) - 3].textContent.trim()

                    }
                }

                Array.prototype.forEach.call(cells, function(td) {
                    td.addEventListener('click', logText);
                });
            })
        })
        .catch(err => {
            console.log(err)
        });
}, 1000)