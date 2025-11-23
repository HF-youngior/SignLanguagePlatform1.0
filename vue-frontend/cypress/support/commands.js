// ***********************************************
// 自定义命令和覆盖现有命令
//
// 例如:
// Cypress.Commands.add('login', (email, password) => { ... })
// ***********************************************

// 等待加载状态消失的自定义命令
Cypress.Commands.add('waitForLoader', () => {
  cy.get('[data-testid=loading]').should('not.exist');
});

// 检查元素是否有特定样式类的命令
Cypress.Commands.add('hasClass', { prevSubject: true }, (subject, className) => {
  expect(subject).to.have.class(className);
  return subject;
});

// 验证元素是否具有特定属性和值的命令
Cypress.Commands.add('hasAttribute', { prevSubject: true }, (subject, attribute, value) => {
  if (value !== undefined) {
    expect(subject).to.have.attr(attribute, value);
  } else {
    expect(subject).to.have.attr(attribute);
  }
  return subject;
});

// 验证API调用次数
Cypress.Commands.add('verifyApiCall', (alias, count) => {
  cy.get(`@${alias}.all`).should('have.length', count);
});

// 模拟网络断开连接
Cypress.Commands.add('goOffline', () => {
  cy.log('**go offline**');
  cy.window().then(win => {
    win.navigator.connection.dispatchEvent(new Event('offline'));
  });
});

// 模拟网络恢复连接
Cypress.Commands.add('goOnline', () => {
  cy.log('**go online**');
  cy.window().then(win => {
    win.navigator.connection.dispatchEvent(new Event('online'));
  });
});
