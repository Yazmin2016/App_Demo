/**
 * Created by hanmiao on 2017/3/13.
 */
var values=[1,2,3,4,5];
var sum=values.reduce(function (pre,cur,index,array) {
    return pre+cur;
})
alert(sum);