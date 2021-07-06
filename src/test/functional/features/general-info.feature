Feature: General Info

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page

  Scenario: Admin user can view and update urgent notices only
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the general tab
    Then I can view the urgent notices
    And I cannot view super admin content

  Scenario: Super user can view and update all fields
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the general tab
    Then I can view the open checkbox
    And I can view the access scheme checkbox
    And I can view the urgent notices
    And I can view the Covid-19 notices
