Feature: Homepage

  Scenario: View the list
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.fact@gmail.com" "Pa55word11"
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario: Update urgent message for court
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
