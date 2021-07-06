Feature: Court Update Urgent Message

  Background: View the list
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario: Urgent notice
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I add an "Urgent Notice" in the field provided "#generalInfoTab #urgent-notice"
    And I click the save button
    Then a success message is displayed on the tab

  Scenario: Welsh Translation
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I have added the "Welsh translation of the urgent notice" in the Urgent Notice Welsh field
    And I click the save button
    Then a success message is displayed on the tab
