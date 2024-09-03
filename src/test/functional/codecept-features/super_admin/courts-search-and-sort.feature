Feature: Courts and tribunals search and sort

  Scenario Outline: As a user when I try to search courts by entering the letters in search box all court names which contains the searchtext should be displayed
    When I log in as a super-admin
    Then I can view the courts or tribunals in a list format
    When I enter "<searchText>" into search textbox
    Then All courts that include "<searchText>" should be displayed sorted by name

    Examples:
      | searchText |
      | as         |

  Scenario Outline: As a user when I try to search courts which includes closed courts, by entering the letters in search box all court names which contains the searchtext should be displayed
    When I log in as a super-admin
    Then I can view the courts or tribunals in a list format
    When I enter "<searchText>" into search textbox
    When I select Include closed courts
    Then All courts that include "<searchText>" should be displayed including closed clourts "<closedCourt>"

    Examples:
      | searchText | closedCourt          |
      | ash        | Ashford County Court |

  Scenario Outline: As a user I should be able to sort courts by name
    When I log in as a super-admin
    Then I can view the courts or tribunals in a list format
    When I enter "<searchText>" into search textbox
    When I click on name to sort in a descending order
    Then Then All courts should be displayed sorted by name in a descending order

    Examples:
      | searchText |
      | as         |

  Scenario Outline: As a user I should be able to see the correct number of search results
    When I log in as a super-admin
    Then I can view the courts or tribunals in a list format
    When I enter "<searchText>" into search textbox
    Then I should be able to see the message "Showing " correct number of " results"

    Examples:
      | searchText |
      | as         |

  Scenario Outline: As a user I should be able to sort in a ascending order courts by last updated
    When I log in as a super-admin
    Then I can view the courts or tribunals in a list format
    When I enter "<searchText>" into search textbox
    When I click on last updated to sort ascending
    Then Then All courts should be displayed in a ascending order

    Examples:
      | searchText |
      | as         |

  Scenario Outline: As a user I should be able to sort in a descending order courts by last updated
    When I log in as a super-admin
    Then I can view the courts or tribunals in a list format
    When I enter "<searchText>" into search textbox
    When I click on last updated to sort descending
    Then Then All courts should be displayed in a descending order

    Examples:
      | searchText |
      | as         |
