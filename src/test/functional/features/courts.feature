Feature: Homepage

  Scenario: View the list
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.fact@gmail.com" "Pa55word11"
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario: View a court profile page
    When I click view next to a court
    Then I am directed to the court profile page
