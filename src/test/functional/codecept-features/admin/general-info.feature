@fact-admin-tab-general
Feature: General Info

  Scenario: Admin user can view and update urgent notices and PUAS flag only
    Given a court is created through the API
    When I log in as an admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over general nav element
    When I click the general tab
    Then I can view the urgent notices
    And I can view the PUAS flag
    And I can view common platform flag checkbox
    And I cannot view super admin content
    And the court is cleaned up through the API
