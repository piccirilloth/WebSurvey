function question(questionTitle, answareList, minAns, maxAns, order, correct, type) {
    this.questionTitle = questionTitle;
    this.type = type;
    if(type === 'close') {
        this.answareList = answareList;
        this.minAns = minAns;
        this.maxAns = maxAns;
        this.correct = correct;
    }
    this.order = order;
}
