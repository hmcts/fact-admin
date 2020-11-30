Feature: Court Open and Access Scheme flags

  Background: View the list
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.super.fact@gmail.com" "Pa55word11"
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order

  Scenario: Open
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the open checkbox
    And I click the update button
    Then a message is displayed on the page

  Scenario: Access scheme
    When I click edit next to court with "aylesbury-magistrates-court-and-family-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I click the Participates in access scheme checkbox
    And I click the update button
    Then a message is displayed on the page
