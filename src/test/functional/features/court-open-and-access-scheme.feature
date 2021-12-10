Feature: Court Open and Access Scheme flags

  Background: View the list
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    Then I can view the courts or tribunals in a list format
    And they are in alphabetical order


  Scenario Outline: Open

    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I click the open checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    When I click the close checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"

    Examples:
      | view_court_slug                            |
      | birmingham-civil-and-family-justice-centre |

  Scenario Outline: Access scheme
    When I click edit next to court with "<view_court_slug>"
    Then I am redirected to the Edit Court page for the chosen court
    When I click the Participates in access scheme checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"
    When I unclick the Participates in access scheme checkbox
    And I click the general info save button
    Then a success message is displayed on the general info tab "General Information updated"

    Examples:
      | view_court_slug                            |
      | birmingham-civil-and-family-justice-centre |
    
