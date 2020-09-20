let demo = new Vue({
    el: "#demo",
    data: {
        gridData: [],
    },
    methods: {
        hello: function() {
            return this.gridData.Date;

        }
    },
    mounted() {

        console.log("mounted");
        let axiOpts = {
            method: 'GET',
            url: '/api/index',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        };

        axios(axiOpts)
            .then(x => {
                this.gridData = x.data;
            })
            .catch(x => console.log(x));


    }
});

